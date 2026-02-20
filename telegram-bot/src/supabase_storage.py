"""Supabase-backed storage for FleetRelay bot (V2 schema).

Replaces in-memory storage with persistent Supabase database.
Uses service_role key to bypass RLS.

V2 schema notes:
- No companies table. telegram_connections validates registered connections.
- drivers: id, telegram_user_id (unique bigint), first_name, last_name, username,
  first_seen_at, last_seen_at, created_at, updated_at
- tickets: id, display_id (auto), driver_id, source_type (business_dm/group),
  source_chat_id, source_name, business_connection_id, status, priority (normal/urgent),
  is_urgent, assigned_operator_id, ai_summary, ai_category, ai_urgency, ai_location,
  claimed_at, resolved_at, dismissed_at, created_at, updated_at
- ticket_messages: id, ticket_id, direction (inbound/outbound), sender_type (driver/operator/system),
  sender_name, sender_user_id, telegram_message_id, content_text, content_type,
  media_url, media_thumbnail_url, ai_media_description, is_internal_note, delivery_status
- raw_messages: id, telegram_message_id, telegram_user_id, chat_id, chat_type,
  content_text, content_type, has_media, classification_result, classification_source,
  ai_raw_response, ticket_id
- telegram_connections: id, connection_type (business_account/group), chat_id,
  business_connection_id, display_name, is_active
- settings: key (text PK), value (jsonb)
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

from supabase import Client, create_client

from src.config import settings
from src.models import (
    BufferedMessage,
    Driver,
    Message,
    MessageSource,
    Ticket,
    TicketCategory,
)

logger = logging.getLogger(__name__)


class SupabaseStorage:
    def __init__(self) -> None:
        if settings.supabase_url and settings.supabase_service_key:
            self.client: Client = create_client(
                settings.supabase_url, settings.supabase_service_key
            )
            self._enabled = True
            logger.info("Supabase storage initialized")
        else:
            self._enabled = False
            logger.warning("Supabase not configured, using in-memory fallback")

        self._buffer: dict[int, BufferedMessage] = {}

    # --- Connection Validation ---

    async def validate_business_connection(
        self, business_connection_id: str
    ) -> bool:
        """Check if a business_connection_id is registered and active."""
        if not self._enabled:
            return False
        result = (
            self.client.table("telegram_connections")
            .select("id")
            .eq("connection_type", "business_account")
            .eq("business_connection_id", business_connection_id)
            .eq("is_active", True)
            .limit(1)
            .execute()
        )
        return bool(result.data)

    async def validate_group_connection(self, chat_id: int) -> bool:
        """Check if a group chat_id is registered and active."""
        if not self._enabled:
            return False
        result = (
            self.client.table("telegram_connections")
            .select("id")
            .eq("connection_type", "group")
            .eq("chat_id", chat_id)
            .eq("is_active", True)
            .limit(1)
            .execute()
        )
        return bool(result.data)

    async def get_connection_display_name(
        self,
        business_connection_id: str | None = None,
        chat_id: int | None = None,
    ) -> str:
        """Get the display_name for a telegram connection."""
        if not self._enabled:
            return ""
        query = self.client.table("telegram_connections").select("display_name").eq("is_active", True)
        if business_connection_id:
            query = query.eq("connection_type", "business_account").eq(
                "business_connection_id", business_connection_id
            )
        elif chat_id is not None:
            query = query.eq("connection_type", "group").eq("chat_id", chat_id)
        else:
            return ""
        result = query.limit(1).execute()
        if result.data:
            return result.data[0].get("display_name", "")
        return ""

    # --- Drivers ---

    async def upsert_driver(
        self,
        telegram_user_id: int,
        first_name: str = "",
        last_name: str = "",
        username: str = "",
    ) -> Driver:
        """Upsert driver by telegram_user_id. V2 drivers have no company_id."""
        if not self._enabled:
            from src.models import _new_id
            return Driver(
                id=_new_id(),
                telegram_user_id=telegram_user_id,
                first_name=first_name,
                last_name=last_name,
                username=username,
            )

        now = datetime.now(timezone.utc).isoformat()

        existing = (
            self.client.table("drivers")
            .select("id")
            .eq("telegram_user_id", telegram_user_id)
            .limit(1)
            .execute()
        )

        if existing.data:
            driver_id = existing.data[0]["id"]
            update_data: dict = {"last_seen_at": now, "updated_at": now}
            if first_name:
                update_data["first_name"] = first_name
            if last_name:
                update_data["last_name"] = last_name
            if username:
                update_data["username"] = username

            self.client.table("drivers").update(update_data).eq(
                "id", driver_id
            ).execute()

            return Driver(
                id=driver_id,
                telegram_user_id=telegram_user_id,
                first_name=first_name,
                last_name=last_name,
                username=username,
            )

        result = (
            self.client.table("drivers")
            .insert(
                {
                    "telegram_user_id": telegram_user_id,
                    "first_name": first_name or "Unknown",
                    "last_name": last_name or None,
                    "username": username or None,
                    "first_seen_at": now,
                    "last_seen_at": now,
                }
            )
            .execute()
        )

        driver_id = result.data[0]["id"]
        return Driver(
            id=driver_id,
            telegram_user_id=telegram_user_id,
            first_name=first_name,
            last_name=last_name,
            username=username,
        )

    async def get_driver(self, driver_id: str) -> Driver | None:
        if not self._enabled:
            return None
        result = (
            self.client.table("drivers")
            .select("*")
            .eq("id", driver_id)
            .limit(1)
            .execute()
        )
        if not result.data:
            return None
        d = result.data[0]
        return Driver(
            id=d["id"],
            telegram_user_id=d.get("telegram_user_id") or 0,
            first_name=d.get("first_name", ""),
            last_name=d.get("last_name", ""),
            username=d.get("username", ""),
        )

    async def get_driver_by_telegram_id(
        self, telegram_user_id: int
    ) -> Driver | None:
        if not self._enabled:
            return None
        result = (
            self.client.table("drivers")
            .select("*")
            .eq("telegram_user_id", telegram_user_id)
            .limit(1)
            .execute()
        )
        if not result.data:
            return None
        d = result.data[0]
        return Driver(
            id=d["id"],
            telegram_user_id=d.get("telegram_user_id") or 0,
            first_name=d.get("first_name", ""),
            last_name=d.get("last_name", ""),
            username=d.get("username", ""),
        )

    # --- Open Ticket Check ---

    async def find_open_ticket_for_driver(
        self,
        driver_id: str,
        source_type: str,
        source_identifier: int | str,
        hours: int = 4,
    ) -> dict | None:
        """Find an open/in_progress ticket for this driver on the same source within the time window."""
        if not self._enabled:
            return None
        cutoff = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()
        query = (
            self.client.table("tickets")
            .select("id, status, updated_at, source_type, source_chat_id, business_connection_id")
            .eq("driver_id", driver_id)
            .in_("status", ["open", "in_progress", "on_hold"])
            .gte("updated_at", cutoff)
            .order("updated_at", desc=True)
            .limit(1)
        )

        if source_type == "business_dm":
            query = query.eq("business_connection_id", str(source_identifier))
        else:
            query = query.eq("source_chat_id", int(source_identifier))

        result = query.execute()
        return result.data[0] if result.data else None

    async def find_recently_resolved_ticket(
        self, driver_id: str, hours: int = 24
    ) -> dict | None:
        """Find a recently resolved ticket for gratitude detection."""
        if not self._enabled:
            return None
        cutoff = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()
        result = (
            self.client.table("tickets")
            .select("id, resolved_at")
            .eq("driver_id", driver_id)
            .eq("status", "resolved")
            .gte("resolved_at", cutoff)
            .order("resolved_at", desc=True)
            .limit(1)
            .execute()
        )
        return result.data[0] if result.data else None

    # --- Reply Thread Lookup (group chats) ---

    async def find_ticket_by_message_telegram_id(
        self,
        chat_id: int,
        telegram_message_id: int,
    ) -> dict | None:
        """Find a ticket by looking up a ticket_message with a specific telegram message ID."""
        if not self._enabled:
            return None
        result = (
            self.client.table("ticket_messages")
            .select("ticket_id")
            .eq("telegram_message_id", telegram_message_id)
            .limit(1)
            .execute()
        )
        if not result.data:
            return None
        ticket_id = result.data[0]["ticket_id"]
        ticket_result = (
            self.client.table("tickets")
            .select("id, status")
            .eq("id", ticket_id)
            .eq("source_chat_id", chat_id)
            .in_("status", ["open", "in_progress", "on_hold"])
            .limit(1)
            .execute()
        )
        return ticket_result.data[0] if ticket_result.data else None

    # --- Tickets ---

    async def create_ticket(self, ticket: Ticket) -> str:
        """Create a ticket in Supabase. Returns ticket ID.
        display_id is auto-generated by the DB default."""
        if not self._enabled:
            return ticket.id

        source_type = (
            ticket.source_type.value
            if hasattr(ticket.source_type, "value")
            else str(ticket.source_type)
        )

        is_urgent = ticket.ai_urgency >= 4
        priority = "urgent" if is_urgent else "normal"

        ai_category = (
            ticket.ai_category.value
            if hasattr(ticket.ai_category, "value")
            else str(ticket.ai_category)
        )
        if ai_category == "unclassified":
            ai_category = "other"

        data: dict = {
            "driver_id": ticket.driver_id,
            "source_type": source_type,
            "source_chat_id": ticket.source_chat_id or None,
            "source_name": ticket.source_name or None,
            "business_connection_id": ticket.business_connection_id or None,
            "status": "open",
            "priority": priority,
            "is_urgent": is_urgent,
            "ai_category": ai_category,
            "ai_urgency": ticket.ai_urgency,
            "ai_summary": ticket.ai_summary or None,
        }

        result = self.client.table("tickets").insert(data).execute()
        ticket_id = result.data[0]["id"]
        return ticket_id

    async def update_ticket(self, ticket_id: str, **updates: object) -> None:
        """Update ticket fields in Supabase."""
        if not self._enabled:
            return
        update_data: dict = {}
        field_map = {
            "urgency": "ai_urgency",
            "category": "ai_category",
            "location": "ai_location",
            "summary": "ai_summary",
            "status": "status",
        }
        for key, value in updates.items():
            db_field = field_map.get(key, key)
            if hasattr(value, "value"):
                value = value.value
            if db_field == "ai_category" and value == "unclassified":
                value = "other"
            update_data[db_field] = value

        if "ai_urgency" in update_data:
            urgency_val = update_data["ai_urgency"]
            if isinstance(urgency_val, int) and urgency_val >= 4:
                update_data["is_urgent"] = True
                update_data["priority"] = "urgent"

        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        self.client.table("tickets").update(update_data).eq("id", ticket_id).execute()

    async def append_message_to_ticket(
        self,
        ticket_id: str,
        message: Message,
        driver_name: str = "",
    ) -> None:
        """Add a driver message to an existing ticket via ticket_messages table."""
        if not self._enabled:
            return
        content_type = "text"
        if message.has_photo:
            content_type = "photo"
        elif message.has_video:
            content_type = "video"
        elif message.has_voice:
            content_type = "voice"
        elif message.has_location:
            content_type = "location"
        elif message.has_document:
            content_type = "document"

        self.client.table("ticket_messages").insert(
            {
                "ticket_id": ticket_id,
                "direction": "inbound",
                "sender_type": "driver",
                "sender_name": driver_name,
                "content_text": message.text or f"[{content_type}]",
                "content_type": content_type,
                "telegram_message_id": message.telegram_message_id,
                "is_internal_note": False,
            }
        ).execute()

        self.client.table("tickets").update(
            {"updated_at": datetime.now(timezone.utc).isoformat()}
        ).eq("id", ticket_id).execute()

    # --- Raw Messages (Audit Trail) ---

    async def log_raw_message(
        self,
        message: Message,
        classification_result: str,
        classification_source: str,
        ticket_id: str | None = None,
        ai_response: dict | None = None,
    ) -> None:
        """Log a raw message for audit trail."""
        if not self._enabled:
            return
        content_type = "text"
        has_media = False
        if message.has_photo:
            content_type = "photo"
            has_media = True
        elif message.has_video:
            content_type = "video"
            has_media = True
        elif message.has_voice:
            content_type = "voice"
            has_media = True
        elif message.has_location:
            content_type = "location"
            has_media = True
        elif message.has_document:
            content_type = "document"
            has_media = True

        chat_type = "private" if message.source == MessageSource.DM else "group"

        try:
            self.client.table("raw_messages").insert(
                {
                    "telegram_message_id": message.telegram_message_id,
                    "telegram_user_id": message.telegram_user_id,
                    "chat_id": message.telegram_chat_id,
                    "chat_type": chat_type,
                    "content_text": (
                        message.text[:2000] if message.text else None
                    ),
                    "content_type": content_type,
                    "has_media": has_media,
                    "classification_result": classification_result,
                    "classification_source": classification_source,
                    "ticket_id": ticket_id,
                    "ai_raw_response": ai_response,
                }
            ).execute()
        except Exception as e:
            logger.error("Failed to log raw message: %s", e)

    # --- Messages (create ticket_message for new ticket) ---

    async def save_message_as_ticket_message(
        self,
        message: Message,
        ticket_id: str,
        driver_name: str = "",
    ) -> None:
        """Save a message as a ticket_message (for initial ticket creation)."""
        await self.append_message_to_ticket(ticket_id, message, driver_name)

    # --- Buffer (kept in-memory, short-lived) ---

    async def buffer_message(
        self, telegram_user_id: int, entry: BufferedMessage
    ) -> None:
        self._buffer[telegram_user_id] = entry

    async def get_buffered(self, telegram_user_id: int) -> BufferedMessage | None:
        return self._buffer.get(telegram_user_id)

    async def pop_buffered(self, telegram_user_id: int) -> BufferedMessage | None:
        return self._buffer.pop(telegram_user_id, None)

    async def get_expired_buffers(self) -> list[tuple[int, BufferedMessage]]:
        now = datetime.now(timezone.utc)
        expired: list[tuple[int, BufferedMessage]] = []
        for user_id, entry in list(self._buffer.items()):
            if entry.expires_at <= now:
                expired.append((user_id, entry))
                del self._buffer[user_id]
        return expired

    # --- Stats ---

    async def stats(self) -> dict[str, int]:
        if not self._enabled:
            return {"drivers": 0, "tickets": 0, "buffered": len(self._buffer)}
        try:
            drivers = (
                self.client.table("drivers").select("id", count="exact").execute()
            )
            tickets = (
                self.client.table("tickets").select("id", count="exact").execute()
            )
            return {
                "drivers": drivers.count or 0,
                "tickets": tickets.count or 0,
                "buffered": len(self._buffer),
            }
        except Exception:
            return {"drivers": 0, "tickets": 0, "buffered": len(self._buffer)}


# Singleton
storage = SupabaseStorage()
