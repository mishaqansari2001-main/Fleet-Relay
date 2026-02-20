"""Two-layer message classification pipeline.

Layer 1: Deterministic keyword/heuristic matching (~55% of messages, instant, free).
Layer 2: AI classification via GPT-4o-mini (~45% of messages).
Fail-open: if AI fails, create ticket anyway.
"""

from __future__ import annotations

import json
import logging
import re

import openai

from src.config import settings
from src.models import (
    ClassificationResult,
    EnrichmentResult,
    ImageCategory,
    Message,
    TicketCategory,
)

logger = logging.getLogger(__name__)

# --- Layer 1: Deterministic Rules ---

TICKET_KEYWORDS: dict[str, TicketCategory] = {
    # Mechanical
    "breakdown": TicketCategory.MECHANICAL,
    "broke down": TicketCategory.MECHANICAL,
    "engine": TicketCategory.MECHANICAL,
    "overheating": TicketCategory.MECHANICAL,
    "overheat": TicketCategory.MECHANICAL,
    "won't start": TicketCategory.MECHANICAL,
    "wont start": TicketCategory.MECHANICAL,
    "stalled": TicketCategory.MECHANICAL,
    "transmission": TicketCategory.MECHANICAL,
    "coolant": TicketCategory.MECHANICAL,
    "radiator": TicketCategory.MECHANICAL,
    "alternator": TicketCategory.MECHANICAL,
    "battery dead": TicketCategory.ELECTRICAL,
    # Tire
    "flat tire": TicketCategory.TIRE,
    "blowout": TicketCategory.TIRE,
    "tire blew": TicketCategory.TIRE,
    "flat": TicketCategory.TIRE,
    "tire pressure": TicketCategory.TIRE,
    "tire damage": TicketCategory.TIRE,
    # Fuel
    "fuel": TicketCategory.FUEL,
    "out of gas": TicketCategory.FUEL,
    "diesel": TicketCategory.FUEL,
    "fuel leak": TicketCategory.FUEL,
    # Brake
    "brake": TicketCategory.MECHANICAL,
    "brakes": TicketCategory.MECHANICAL,
    "brake failure": TicketCategory.MECHANICAL,
    # Accident
    "accident": TicketCategory.ACCIDENT,
    "crash": TicketCategory.ACCIDENT,
    "collision": TicketCategory.ACCIDENT,
    "hit": TicketCategory.ACCIDENT,
    "wreck": TicketCategory.ACCIDENT,
    # Electrical
    "electrical": TicketCategory.ELECTRICAL,
    "lights out": TicketCategory.ELECTRICAL,
    "no power": TicketCategory.ELECTRICAL,
    "wiring": TicketCategory.ELECTRICAL,
    # ELD / Compliance
    "eld": TicketCategory.ELD,
    "dot inspection": TicketCategory.ELD,
    "dot": TicketCategory.ELD,
    "hos": TicketCategory.ELD,
    "hours of service": TicketCategory.ELD,
    "logbook": TicketCategory.ELD,
    # Documentation
    "permit": TicketCategory.DOCUMENTATION,
    "registration": TicketCategory.DOCUMENTATION,
    "insurance": TicketCategory.DOCUMENTATION,
    "paperwork": TicketCategory.DOCUMENTATION,
    # General fleet
    "load": TicketCategory.OTHER,
    "dispatch": TicketCategory.OTHER,
    "gps": TicketCategory.ELECTRICAL,
    "trailer": TicketCategory.MECHANICAL,
    "oil": TicketCategory.MECHANICAL,
    "oil leak": TicketCategory.MECHANICAL,
    "check engine": TicketCategory.MECHANICAL,
}

DISMISS_PATTERNS: list[re.Pattern[str]] = [
    re.compile(r"^(ok|okay|k|kk|yes|no|yep|nope|ya|nah|sure|yea|yeah)\.?$", re.IGNORECASE),
    re.compile(r"^thanks?\.?$", re.IGNORECASE),
    re.compile(r"^thank you\.?$", re.IGNORECASE),
    re.compile(r"^(hi|hello|hey|yo|sup|good morning|good evening|good night)\.?!?$", re.IGNORECASE),
    re.compile(r"^[\U0001f600-\U0001f64f\U0001f44d\U0001f44e\u2764\u2705\u274c\U0001f389\U0001f525\s]+$"),  # emoji-only
    re.compile(r"^[.!?]+$"),  # punctuation-only
    # Multilingual greetings (Uzbek, Russian)
    re.compile(r"^(salom|assalomu?\s*alaykum|va?\s*alaykum\s*as?salom)\.?!?$", re.IGNORECASE),
    re.compile(r"^(привет|здравствуй(те)?|доброе утро|добрый (день|вечер)|салом)\.?!?$", re.IGNORECASE),
    # Reactions / filler
    re.compile(r"^(haha|hahaha|lol|😂|👍|\+1|\)\)+|hhh+)$", re.IGNORECASE),
]

URGENCY_KEYWORDS: dict[str, int] = {
    "accident": 5,
    "crash": 5,
    "collision": 5,
    "fire": 5,
    "emergency": 5,
    "stranded": 4,
    "stuck": 4,
    "breakdown": 4,
    "broke down": 4,
    "brake failure": 5,
    "overheating": 4,
    "overheat": 4,
    "flat tire": 3,
    "blowout": 4,
    "eld": 2,
    "dot": 3,
    "paperwork": 1,
    "permit": 1,
}

# Keywords that should NOT be dismissed even if single word <6 chars
_PROTECTED_SHORT_WORDS = {"help", "eld", "dot", "fuel", "flat", "fire"}


def _should_dismiss(text: str) -> bool:
    """Check if message is just a greeting/acknowledgment that should be ignored."""
    text = text.strip()
    if len(text) == 0:
        return True
    if len(text) <= 3 and not any(c.isalpha() for c in text):
        return True

    # Single short word dismissal (unless it's a protected keyword)
    words = text.split()
    if len(words) == 1 and len(text) < 6 and not any(kw in text.lower() for kw in _PROTECTED_SHORT_WORDS):
        return True

    return any(p.match(text) for p in DISMISS_PATTERNS)


def _match_keywords(text: str) -> tuple[TicketCategory | None, int]:
    """Match text against keyword patterns. Returns (category, urgency) or (None, 0)."""
    text_lower = text.lower()
    best_category: TicketCategory | None = None
    best_urgency = 0

    for keyword, category in TICKET_KEYWORDS.items():
        if keyword in text_lower:
            urgency = URGENCY_KEYWORDS.get(keyword, 3)
            if urgency > best_urgency:
                best_urgency = urgency
                best_category = category

    return best_category, best_urgency


def classify_deterministic(message: Message) -> ClassificationResult | None:
    """Layer 1: deterministic classification. Returns None if undecided (pass to AI)."""
    # Photo/video attachments from drivers are likely ticket-worthy
    if message.has_photo or message.has_video:
        return ClassificationResult(
            is_ticket=True,
            confidence=4,
            category=TicketCategory.UNCLASSIFIED,
            urgency=3,
            layer="deterministic",
            reason="media_attachment",
        )

    # Document attachments are potentially ticket-worthy
    if message.has_document:
        return ClassificationResult(
            is_ticket=True,
            confidence=3,
            category=TicketCategory.DOCUMENTATION,
            urgency=2,
            layer="deterministic",
            reason="document_attachment",
        )

    # Location sharing suggests roadside issue
    if message.has_location:
        return ClassificationResult(
            is_ticket=True,
            confidence=4,
            category=TicketCategory.MECHANICAL,
            urgency=4,
            layer="deterministic",
            reason="location_shared",
        )

    # Voice messages get flagged for review (create ticket)
    if message.has_voice:
        return ClassificationResult(
            is_ticket=True,
            confidence=3,
            category=TicketCategory.UNCLASSIFIED,
            urgency=3,
            layer="deterministic",
            reason="voice_message",
        )

    text = message.text.strip()
    if not text:
        return ClassificationResult(
            is_ticket=False,
            confidence=5,
            category=TicketCategory.UNCLASSIFIED,
            urgency=1,
            layer="deterministic",
            reason="empty_message",
        )

    # Filter out greetings/acknowledgments
    if _should_dismiss(text):
        return ClassificationResult(
            is_ticket=False,
            confidence=5,
            category=TicketCategory.UNCLASSIFIED,
            urgency=1,
            layer="deterministic",
            reason="dismissed_noise",
        )

    # Keyword matching
    category, urgency = _match_keywords(text)
    if category is not None:
        return ClassificationResult(
            is_ticket=True,
            confidence=4,
            category=category,
            urgency=urgency,
            layer="deterministic",
            reason="keyword_match",
        )

    # Undecided — pass to Layer 2
    return None


# --- Layer 2: AI Classification ---

_client: openai.AsyncOpenAI | None = None


def _get_openai_client() -> openai.AsyncOpenAI:
    global _client
    if _client is None:
        _client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
    return _client


CLASSIFICATION_PROMPT = """You are a support ticket classifier for a trucking/logistics fleet company.
Drivers send messages via Telegram when they have issues with their trucks, ELD devices,
documentation, or need dispatch help.

Analyze the following message and determine:
1. is_ticket: Is this a support request that needs a ticket? (true/false)
2. confidence: How confident are you? (1-5, where 5 is certain)
3. category: One of: mechanical, electrical, tire, fuel, accident, eld, documentation, other
4. urgency: How urgent? (1-5, where 5 is emergency)

Respond with ONLY a JSON object, no other text:
{"is_ticket": bool, "confidence": int, "category": str, "urgency": int}"""


async def classify_ai(message: Message) -> ClassificationResult:
    """Layer 2: AI classification via GPT-4o-mini. Fail-open on errors."""
    client = _get_openai_client()

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": CLASSIFICATION_PROMPT},
                {"role": "user", "content": message.text[:1000]},
            ],
            temperature=0.1,
            max_tokens=100,
            timeout=settings.ai_timeout_seconds,
        )

        content = response.choices[0].message.content or ""
        data = json.loads(content)

        return ClassificationResult(
            is_ticket=bool(data.get("is_ticket", True)),
            confidence=max(1, min(5, int(data.get("confidence", 3)))),
            category=TicketCategory(data.get("category", "unclassified")),
            urgency=max(1, min(5, int(data.get("urgency", 3)))),
            layer="ai",
            reason="gpt4o_mini_classification",
        )

    except (json.JSONDecodeError, KeyError, ValueError) as e:
        logger.warning("AI classification parse error: %s", e)
        return _fail_open_result("ai_parse_error")

    except Exception as e:
        logger.error("AI classification failed: %s", e)
        return _fail_open_result("ai_call_failed")


IMAGE_CLASSIFICATION_PROMPT = """Classify this image sent by a truck driver to fleet support.
Categories: mechanical (engine/parts issues), accident (crash/damage), document (paperwork/forms),
road (road conditions/signs), irrelevant (not related to fleet support).

Respond with ONLY a JSON object:
{"category": str, "description": str}"""


async def classify_image(file_url: str) -> tuple[ImageCategory, str]:
    """Classify an image using GPT-4o-mini vision. Returns (category, description)."""
    client = _get_openai_client()

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": IMAGE_CLASSIFICATION_PROMPT},
                {
                    "role": "user",
                    "content": [
                        {"type": "image_url", "image_url": {"url": file_url, "detail": "low"}},
                    ],
                },
            ],
            temperature=0.1,
            max_tokens=100,
            timeout=settings.ai_timeout_seconds,
        )

        content = response.choices[0].message.content or ""
        data = json.loads(content)
        category = ImageCategory(data.get("category", "irrelevant"))
        description = str(data.get("description", ""))
        return category, description

    except Exception as e:
        logger.error("Image classification failed: %s", e)
        return ImageCategory.IRRELEVANT, ""


ENRICHMENT_PROMPT = """You are a support ticket enrichment system for a trucking fleet.
Given the messages below from a truck driver, extract:
1. urgency: 1-5 (1=low, 5=emergency)
2. category: mechanical, electrical, tire, fuel, accident, eld, documentation, other
3. location: any location mentioned (city, highway, mile marker, etc.) or empty string
4. summary: one-sentence summary of the issue

Respond with ONLY a JSON object:
{"urgency": int, "category": str, "location": str, "summary": str}"""


async def enrich_ticket(messages: list[str]) -> EnrichmentResult:
    """Post-creation enrichment: extract urgency, category, location, summary."""
    client = _get_openai_client()
    combined = "\n---\n".join(messages)

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": ENRICHMENT_PROMPT},
                {"role": "user", "content": combined[:2000]},
            ],
            temperature=0.1,
            max_tokens=150,
            timeout=settings.ai_timeout_seconds,
        )

        content = response.choices[0].message.content or ""
        data = json.loads(content)

        return EnrichmentResult(
            urgency=max(1, min(5, int(data.get("urgency", 3)))),
            category=TicketCategory(data.get("category", "unclassified")),
            location=str(data.get("location", "")),
            summary=str(data.get("summary", "")),
        )

    except Exception as e:
        logger.error("Ticket enrichment failed: %s", e)
        return EnrichmentResult()


async def classify_message(message: Message) -> ClassificationResult:
    """Full classification pipeline: Layer 1 deterministic, then Layer 2 AI."""
    # Try deterministic first
    result = classify_deterministic(message)
    if result is not None:
        return result

    # Fall through to AI
    if message.text.strip():
        return await classify_ai(message)

    # No text and no media — dismiss
    return ClassificationResult(
        is_ticket=False,
        confidence=5,
        category=TicketCategory.UNCLASSIFIED,
        urgency=1,
        layer="deterministic",
        reason="no_content",
    )


def _fail_open_result(reason: str) -> ClassificationResult:
    """Fail-open: create ticket on AI failure. Never miss a driver message."""
    return ClassificationResult(
        is_ticket=True,
        confidence=0,
        category=TicketCategory.UNCLASSIFIED,
        urgency=3,
        layer="ai",
        reason=reason,
    )
