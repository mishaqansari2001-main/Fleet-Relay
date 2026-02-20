"""Telegram bot handler for FleetRelay (V2 schema).

Handles Business Account DMs (via business_connection_id) and Group Chat messages.
Classifies incoming messages, manages the buffer system, and creates tickets.
Implements 4-hour open ticket windowing, gratitude detection, and reply threading.

V2 notes:
- No companies table. telegram_connections validates registered connections.
- Tickets use source_type (business_dm/group), ai_category, ai_urgency, ai_summary.
- Messages stored in ticket_messages (not ticket_events).
- Drivers identified by telegram_user_id (unique, no company_id).
"""

from __future__ import annotations

import asyncio
import logging
import re
from datetime import datetime, timedelta, timezone

from telegram import Update
from telegram.ext import (
    Application,
    ContextTypes,
    MessageHandler,
    filters,
)

from src.classifier import classify_message, enrich_ticket
from src.config import settings
from src.models import (
    BufferedMessage,
    ClassificationResult,
    Driver,
    Message,
    MessageSource,
    Ticket,
    TicketCategory,
)
from src.supabase_storage import storage

logger = logging.getLogger(__name__)

# --- Gratitude patterns ---

GRATITUDE_PATTERNS = [
    re.compile(r"^(thanks?|thank\s*you|thx|ty)\.?!?$", re.IGNORECASE),
    re.compile(r"^(rahmat|raxmat|спасибо|спс|благодарю)\.?!?$", re.IGNORECASE),
]


def _is_gratitude(text: str) -> bool:
    text = text.strip()
    if not text:
        return False
    return any(p.match(text) for p in GRATITUDE_PATTERNS)


# --- Message extraction ---


def _extract_message(update: Update) -> Message | None:
    tg_msg = update.message or update.edited_message
    if tg_msg is None or tg_msg.from_user is None:
        return None

    source = MessageSource.DM
    business_connection_id = ""

    if hasattr(tg_msg, "business_connection_id") and tg_msg.business_connection_id:
        source = MessageSource.DM
        business_connection_id = tg_msg.business_connection_id
    elif tg_msg.chat.type in ("group", "supergroup"):
        source = MessageSource.GROUP

    return Message(
        telegram_message_id=tg_msg.message_id,
        telegram_chat_id=tg_msg.chat_id,
        telegram_user_id=tg_msg.from_user.id,
        driver_id="",
        text=tg_msg.text or tg_msg.caption or "",
        has_photo=bool(tg_msg.photo),
        has_video=bool(tg_msg.video or tg_msg.video_note),
        has_voice=bool(tg_msg.voice),
        has_location=bool(tg_msg.location),
        has_document=bool(tg_msg.document),
        source=source,
        business_connection_id=business_connection_id,
        raw_data={},
    )


# --- Ticket creation ---


async def _create_ticket_from_message(
    message: Message,
    classification: ClassificationResult,
    driver: Driver,
    source_name: str = "",
    extra_messages: list[Message] | None = None,
) -> Ticket:
    all_messages = [message]
    if extra_messages:
        all_messages.extend(extra_messages)

    message_ids = [m.id for m in all_messages]

    is_urgent = classification.urgency >= 4
    priority = "urgent" if is_urgent else "normal"

    ticket = Ticket(
        driver_id=message.driver_id,
        ai_category=classification.category,
        ai_urgency=classification.urgency,
        source_type=message.source,
        source_chat_id=message.telegram_chat_id,
        source_name=source_name,
        business_connection_id=message.business_connection_id,
        is_urgent=is_urgent,
        priority=priority,
        message_ids=message_ids,
        classification=classification,
    )
    ticket_id = await storage.create_ticket(ticket)
    ticket.id = ticket_id

    await storage.save_message_as_ticket_message(
        message=message,
        ticket_id=ticket_id,
        driver_name=driver.display_name,
    )

    logger.info(
        "Ticket %s created — driver=%s ai_category=%s ai_urgency=%d confidence=%d",
        ticket_id,
        ticket.driver_id,
        ticket.ai_category,
        ticket.ai_urgency,
        classification.confidence,
    )

    await storage.log_raw_message(
        message=message,
        classification_result="created",
        classification_source=classification.layer,
        ticket_id=ticket_id,
    )

    texts = [m.text for m in all_messages if m.text]
    if texts:
        asyncio.create_task(_enrich_ticket_async(ticket_id, texts))

    return ticket


async def _enrich_ticket_async(ticket_id: str, texts: list[str]) -> None:
    try:
        enrichment = await enrich_ticket(texts)
        await storage.update_ticket(
            ticket_id,
            urgency=enrichment.urgency,
            category=enrichment.category,
            location=enrichment.location,
            summary=enrichment.summary,
        )
        logger.info("Ticket %s enriched — %s", ticket_id, enrichment.summary[:80])
    except Exception as e:
        logger.error("Enrichment failed for ticket %s: %s", ticket_id, e)


# --- Buffer management ---


async def _handle_buffered(
    message: Message,
    classification: ClassificationResult,
    driver: Driver,
    source_name: str = "",
) -> None:
    user_id = driver.telegram_user_id

    existing = await storage.get_buffered(user_id)
    if existing is not None:
        await storage.pop_buffered(user_id)
        merged = ClassificationResult(
            is_ticket=True,
            confidence=max(existing.classification.confidence, classification.confidence),
            category=existing.classification.category,
            urgency=max(existing.classification.urgency, classification.urgency),
            layer="buffer_merge",
            reason="follow_up_received",
        )
        await _create_ticket_from_message(
            message, merged, driver, source_name=source_name, extra_messages=[existing.message]
        )
        return

    expires_at = datetime.now(timezone.utc) + timedelta(seconds=settings.buffer_timeout_seconds)
    entry = BufferedMessage(
        message=message,
        classification=classification,
        expires_at=expires_at,
    )
    await storage.buffer_message(user_id, entry)
    logger.info(
        "Message buffered for driver %s (confidence=%d) — expires in %ds",
        message.driver_id,
        classification.confidence,
        settings.buffer_timeout_seconds,
    )


# --- DM Pipeline ---


async def _handle_dm(message: Message, driver: Driver, source_name: str, update: Update) -> None:
    bcid = message.business_connection_id

    open_ticket = await storage.find_open_ticket_for_driver(
        driver_id=message.driver_id,
        source_type="business_dm",
        source_identifier=bcid,
        hours=4,
    )
    if open_ticket is not None:
        tid = open_ticket["id"]
        await storage.append_message_to_ticket(
            ticket_id=tid,
            message=message,
            driver_name=driver.display_name,
        )
        await storage.log_raw_message(
            message=message,
            classification_result="appended",
            classification_source="window_match",
            ticket_id=tid,
        )
        logger.info("Appended DM to existing ticket %s for driver %s", tid, message.driver_id)
        return

    if _is_gratitude(message.text):
        recent_resolved = await storage.find_recently_resolved_ticket(
            driver_id=message.driver_id,
            hours=24,
        )
        if recent_resolved is not None:
            await storage.log_raw_message(
                message=message,
                classification_result="dismissed",
                classification_source="gratitude_after_resolve",
            )
            logger.info(
                "Dismissed gratitude message from driver %s (resolved ticket %s)",
                message.driver_id,
                recent_resolved["id"],
            )
            return

    classification = await classify_message(message)

    logger.debug(
        "DM classification for driver %s: is_ticket=%s confidence=%d category=%s",
        message.driver_id,
        classification.is_ticket,
        classification.confidence,
        classification.category,
    )

    if not classification.is_ticket:
        await storage.log_raw_message(
            message=message,
            classification_result="dismissed",
            classification_source=classification.layer,
        )
        return

    if classification.confidence <= 2:
        await storage.log_raw_message(
            message=message,
            classification_result="buffered",
            classification_source=classification.layer,
        )
        await _handle_buffered(message, classification, driver, source_name=source_name)
        return

    await _create_ticket_from_message(message, classification, driver, source_name=source_name)


# --- Group Pipeline ---


async def _handle_group(message: Message, driver: Driver, source_name: str, update: Update) -> None:
    tg_msg = update.message

    if tg_msg and tg_msg.reply_to_message:
        replied_msg_id = tg_msg.reply_to_message.message_id
        tracked_ticket = await storage.find_ticket_by_message_telegram_id(
            chat_id=message.telegram_chat_id,
            telegram_message_id=replied_msg_id,
        )
        if tracked_ticket is not None:
            tid = tracked_ticket["id"]
            await storage.append_message_to_ticket(
                ticket_id=tid,
                message=message,
                driver_name=driver.display_name,
            )
            await storage.log_raw_message(
                message=message,
                classification_result="appended",
                classification_source="reply_thread",
                ticket_id=tid,
            )
            logger.info(
                "Appended reply to ticket %s in group %d",
                tid,
                message.telegram_chat_id,
            )
            return

    open_ticket = await storage.find_open_ticket_for_driver(
        driver_id=message.driver_id,
        source_type="group",
        source_identifier=message.telegram_chat_id,
        hours=4,
    )
    if open_ticket is not None:
        tid = open_ticket["id"]
        await storage.append_message_to_ticket(
            ticket_id=tid,
            message=message,
            driver_name=driver.display_name,
        )
        await storage.log_raw_message(
            message=message,
            classification_result="appended",
            classification_source="window_match",
            ticket_id=tid,
        )
        logger.info(
            "Appended group message to existing ticket %s for driver %s",
            tid,
            message.driver_id,
        )
        return

    classification = await classify_message(message)

    logger.debug(
        "Group classification for driver %s: is_ticket=%s confidence=%d category=%s",
        message.driver_id,
        classification.is_ticket,
        classification.confidence,
        classification.category,
    )

    if not classification.is_ticket:
        await storage.log_raw_message(
            message=message,
            classification_result="dismissed",
            classification_source=classification.layer,
        )
        return

    if classification.confidence <= 2:
        await storage.log_raw_message(
            message=message,
            classification_result="buffered",
            classification_source=classification.layer,
        )
        await _handle_buffered(message, classification, driver, source_name=source_name)
        return

    await _create_ticket_from_message(message, classification, driver, source_name=source_name)


# --- Core message handler ---


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    message = _extract_message(update)
    if message is None:
        return

    tg_user = update.message.from_user if update.message else None
    if tg_user is None:
        return

    if tg_user.is_bot:
        return

    # Validate the connection is registered
    is_valid = False
    source_name = ""

    if message.source == MessageSource.DM and message.business_connection_id:
        is_valid = await storage.validate_business_connection(
            message.business_connection_id
        )
        if is_valid:
            source_name = await storage.get_connection_display_name(
                business_connection_id=message.business_connection_id
            )
    elif message.source == MessageSource.GROUP:
        is_valid = await storage.validate_group_connection(message.telegram_chat_id)
        if is_valid:
            source_name = await storage.get_connection_display_name(
                chat_id=message.telegram_chat_id
            )

    if not is_valid:
        logger.warning(
            "Unknown source — no active connection found for %s chat_id=%d bcid=%s. Skipping.",
            message.source,
            message.telegram_chat_id,
            message.business_connection_id,
        )
        return

    # Upsert driver profile (no company_id in V2)
    driver = await storage.upsert_driver(
        telegram_user_id=tg_user.id,
        first_name=tg_user.first_name or "",
        last_name=tg_user.last_name or "",
        username=tg_user.username or "",
    )
    message.driver_id = driver.id

    # Route to appropriate pipeline
    if message.source == MessageSource.DM:
        await _handle_dm(message, driver, source_name, update)
    elif message.source == MessageSource.GROUP:
        await _handle_group(message, driver, source_name, update)


# --- Business message handler ---


async def handle_business_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await handle_message(update, context)


# --- Buffer expiry task ---


async def flush_expired_buffers() -> None:
    while True:
        try:
            expired = await storage.get_expired_buffers()
            for user_id, entry in expired:
                logger.info(
                    "Buffer expired for user %d — silently dismissed (confidence=%d)",
                    user_id,
                    entry.classification.confidence,
                )
        except Exception as e:
            logger.error("Buffer flush error: %s", e)

        await asyncio.sleep(30)


# --- Bot setup ---


def create_bot_application() -> Application:
    app = Application.builder().token(settings.bot_token).build()

    app.add_handler(
        MessageHandler(
            filters.TEXT
            | filters.PHOTO
            | filters.VIDEO
            | filters.VOICE
            | filters.LOCATION
            | filters.DOCUMENT
            | filters.CAPTION,
            handle_message,
        )
    )

    return app
