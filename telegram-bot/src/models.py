from __future__ import annotations

import uuid
from datetime import datetime, timezone
from enum import StrEnum

from pydantic import BaseModel, Field


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _new_id() -> str:
    return uuid.uuid4().hex[:12]


# --- Enums ---


class TicketStatus(StrEnum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


class TicketCategory(StrEnum):
    MECHANICAL = "mechanical"
    ELECTRICAL = "electrical"
    TIRE = "tire"
    FUEL = "fuel"
    ACCIDENT = "accident"
    ELD = "eld"
    DOCUMENTATION = "documentation"
    OTHER = "other"
    UNCLASSIFIED = "unclassified"


class Urgency(StrEnum):
    LOW = "1"
    MEDIUM = "2"
    HIGH = "3"
    CRITICAL = "4"
    EMERGENCY = "5"


class MessageSource(StrEnum):
    DM = "business_dm"
    GROUP = "group"


class ImageCategory(StrEnum):
    MECHANICAL = "mechanical"
    ACCIDENT = "accident"
    DOCUMENT = "document"
    ROAD = "road"
    IRRELEVANT = "irrelevant"


# --- Classification ---


class ClassificationResult(BaseModel):
    is_ticket: bool
    confidence: int = Field(ge=0, le=5)
    category: TicketCategory = TicketCategory.UNCLASSIFIED
    urgency: int = Field(default=3, ge=1, le=5)
    layer: str = "unknown"  # "deterministic" or "ai"
    reason: str = ""


class EnrichmentResult(BaseModel):
    urgency: int = Field(default=3, ge=1, le=5)
    category: TicketCategory = TicketCategory.UNCLASSIFIED
    location: str = ""
    summary: str = ""


# --- Core Models ---


class Driver(BaseModel):
    id: str = Field(default_factory=_new_id)
    telegram_user_id: int
    first_name: str = ""
    last_name: str = ""
    username: str = ""
    created_at: datetime = Field(default_factory=_utcnow)

    @property
    def display_name(self) -> str:
        name = f"{self.first_name} {self.last_name}".strip()
        return name or self.username or f"Driver #{self.telegram_user_id}"


class Message(BaseModel):
    id: str = Field(default_factory=_new_id)
    telegram_message_id: int
    telegram_chat_id: int
    telegram_user_id: int = 0
    driver_id: str
    text: str = ""
    has_photo: bool = False
    has_video: bool = False
    has_voice: bool = False
    has_location: bool = False
    has_document: bool = False
    source: MessageSource = MessageSource.DM
    business_connection_id: str = ""
    raw_data: dict = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=_utcnow)


class Ticket(BaseModel):
    id: str = Field(default_factory=_new_id)
    driver_id: str
    status: TicketStatus = TicketStatus.OPEN
    ai_category: TicketCategory = TicketCategory.UNCLASSIFIED
    ai_urgency: int = Field(default=3, ge=1, le=5)
    ai_summary: str = ""
    ai_location: str = ""
    source_type: MessageSource = MessageSource.DM
    source_chat_id: int = 0
    source_name: str = ""
    business_connection_id: str = ""
    is_urgent: bool = False
    priority: str = "normal"
    message_ids: list[str] = Field(default_factory=list)
    classification: ClassificationResult | None = None
    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)


class BufferedMessage(BaseModel):
    message: Message
    classification: ClassificationResult
    expires_at: datetime
