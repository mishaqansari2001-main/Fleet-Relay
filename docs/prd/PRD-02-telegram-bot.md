# PRD-02: Telegram Bot & Integration

## Overview

A single Telegram bot connects to **3-4 Business Accounts** and **up to 8 group chats**. It receives all messages, classifies them using a two-layer pipeline (deterministic rules + AI), and creates tickets in the database. Operator replies from the dashboard are routed back to the correct Telegram channel.

The bot is a **Python FastAPI** service that receives Telegram webhook events.

---

## Architecture

```
Single Bot (one bot token)
  |
  +-- Business Account 1 DMs  <-- business_connection_id: "abc"
  +-- Business Account 2 DMs  <-- business_connection_id: "def"
  +-- Business Account 3 DMs  <-- business_connection_id: "ghi"
  +-- Business Account 4 DMs  <-- business_connection_id: "jkl"  (optional)
  |
  +-- Group: chat_id -100xxxxx1
  +-- Group: chat_id -100xxxxx2
  +-- ... (up to 8 groups)
```

- **One bot, one token** — handles all channels.
- **Business Account DMs** — received via `business_message` webhook. Bot can reply on behalf of the business account.
- **Group messages** — received because privacy mode is OFF (configured via BotFather). Bot sees every message in every group.

---

## Driver Identity

- **No pre-existing driver database.** Profiles are auto-created on first contact.
- Telegram provides per message: `user_id` (permanent, unique), `first_name`, `last_name`, `username`.
- `user_id` is consistent across all groups and DMs — the same driver is recognized everywhere.
- On first contact, the bot creates a driver record. On subsequent contacts, it updates `last_seen_at`.

---

## Message Classification Pipeline

### Business DM Pipeline (Simple)

Every DM to a business account is intentional. No noise filtering needed.

```
Business DM arrives
  |
  +-- Does this driver have an OPEN ticket via this business account?
  |     +-- YES, last activity < 4 hours --> APPEND message to existing ticket
  |     +-- NO --> CREATE new ticket (source: business_dm)
  |
  +-- Store message. Push update to dashboard via Realtime.
```

**Gratitude exception:** If the last ticket was resolved < 24 hours ago and the new message matches gratitude patterns (rahmat, spasibo, thanks, shukran), auto-dismiss instead of creating a new ticket.

### Group Chat Pipeline (Two-Layer Classification)

#### Layer 1: Deterministic Rules (instant, free)

Applied in order. If any rule matches, processing stops.

| Step | Rule | Action |
|------|------|--------|
| 1 | Sender is a known operator or admin | SKIP (do not process) |
| 2 | Sender is a bot | SKIP |
| 3 | Service message (join, pin, etc.) | SKIP |
| 4 | Reply to a message belonging to an existing ticket | APPEND to that ticket |
| 5 | Driver has an OPEN ticket in THIS group, last activity < 4 hours | APPEND to existing ticket |
| 6 | Message contains @bot or @company mention | CREATE TICKET immediately |
| 7 | Message is ONLY emoji/sticker | DISMISS |
| 8 | Message is a single word < 6 characters | DISMISS |
| 9 | Message matches greeting patterns (salom, assalomu alaykum, privet, zdravstvuyte, marhaba) | DISMISS |
| 10 | Message is ONLY reaction/laugh (haha, lol, )))), +1) | DISMISS |

After Layer 1, approximately 55% of messages are handled. The remaining 45% proceed to Layer 2.

#### Layer 2: AI Classification (GPT-4o-mini)

Messages that pass Layer 1 without resolution are classified by AI. Processing is split by content type.

**Text messages (~25% of total):**

```
Prompt:
System: Classify messages from a truck driver support group chat.
The company provides roadside assistance and logistics support.
SUPPORT = driver needs help from the company (problems, questions
about services, payments, documents, scheduling, complaints).
CHAT = casual conversation, peer discussion, greetings, jokes,
news sharing, general questions not directed at the company.
Respond with ONLY a JSON object, nothing else.

User: "{message_text}"

{"v": "SUPPORT" or "CHAT", "c": 1-5, "r": "3 word reason"}
```

| AI Result | Action |
|-----------|--------|
| SUPPORT, confidence >= 3 | CREATE TICKET |
| SUPPORT, confidence 1-2 | BUFFER (5 min window) |
| CHAT, confidence >= 3 | DISMISS |
| CHAT, confidence 1-2 | BUFFER (5 min window) |

**Photo messages (~10% of total):**

```
Prompt:
System: Analyze this image sent in a truck driver support group.
Classify and describe.
SUPPORT categories: vehicle damage/mechanical issue, dashboard
warning lights, documents/forms/paperwork, road hazard/blockage,
location/navigation context.
CASUAL categories: food, scenery, selfies, memes, jokes, forwarded
content, unrelated screenshots.
Respond in the SAME LANGUAGE as the accompanying message text.
If no text, respond in Russian.
Respond with ONLY a JSON object.

{"v": "SUPPORT" or "CASUAL", "c": 1-5, "cat": "category", "d": "one sentence description"}
```

| AI Result | Action |
|-----------|--------|
| SUPPORT | CREATE TICKET with AI description attached |
| CASUAL + meaningful text | Run text through text classification |
| CASUAL + no text | DISMISS |

**Video messages (~2% of total):**
- Analyze THUMBNAIL only (first frame auto-generated by Telegram).
- Same vision prompt and logic as photo track.
- Full video stored but not analyzed.

**Document attachments (PDF, etc.):**
- AUTO-CREATE TICKET. Documents in support groups are almost always support-related.
- No AI classification needed.

**Location shares:**
- AUTO-CREATE TICKET. Location share = "I'm here, need help."
- Reverse geocode lat/long to human-readable address (OpenStreetMap Nominatim API).
- No AI classification needed.

**Voice messages:**
- AUTO-CREATE TICKET.
- Audio file stored and playable in the dashboard.
- No transcription in initial build.

#### Buffer Resolution (5-Minute Window)

Messages with AI confidence 1-2 enter a per-driver buffer.

| Trigger | Action |
|---------|--------|
| Driver sends another message within 5 minutes | Combine all buffered messages, re-run classification on combined context |
| 5 minutes pass with no follow-up | SILENTLY DISMISS. No ticket created. Message logged in audit trail. |

---

## Post-Creation AI Enrichment (Async)

After a ticket is created, a background task enriches it. This does NOT block ticket creation — operators see the ticket immediately. Enrichment data appears 1-2 seconds later via Realtime.

```
Prompt:
System: Analyze this support ticket from a truck driver.
Provide all four fields. Respond in the same language as the driver's messages.
If mixed, use Russian.

Ticket messages:
{all_ticket_messages}

Respond with ONLY a JSON object:
{
  "urgency": 1-5 (5 = immediate safety risk),
  "category": "breakdown|documents|payment|scheduling|road_hazard|complaint|other",
  "location": "extracted location or null",
  "summary": "one sentence summary of the issue"
}
```

- **Urgency 4-5**: Auto-sets ticket priority to URGENT.
- **Category**: Auto-tags for filtering and analytics (operator can override when resolving).
- **Location**: Stored for reference.
- **Summary**: Shown in the ticket list for quick scanning.

---

## Two-Way Messaging (Dashboard to Telegram)

### Operator Sends Reply via Dashboard

When an operator sends a reply from the ticket detail view in the dashboard:

1. The reply is saved as a `ticket_message` with `direction: outbound` and `sender_type: operator`.
2. The dashboard sends a request to the bot's API to deliver the message to Telegram.
3. The bot routes the message to the correct channel:

**For Business DM tickets:**
- API call: `sendMessage` with `business_connection_id`.
- Driver sees a normal DM reply from the business account.

**For Group tickets:**
- API call: `sendMessage` to the group `chat_id` with `reply_to_message_id` set to the driver's last message in that ticket.
- Message appears in the group as a reply to the driver's specific message.

4. The `telegram_message_id` of the sent message is stored on the `ticket_message` record for future reply targeting.

### Driver Replies Back

When a driver replies to an operator's message (or sends a new message that matches an existing open ticket):

1. The bot's existing classification pipeline handles it:
   - If the driver replies to the bot's message (via `reply_to_message_id`), it is APPENDED to the existing ticket.
   - If the driver has an open ticket with activity < 4 hours, the message is APPENDED.
2. The new message appears in the dashboard ticket detail view via Supabase Realtime.

---

## Message Audit Trail

**Every message** (except operator/bot/service messages) is stored in a `raw_messages` table regardless of classification outcome.

| Outcome | Stored? | Creates ticket? | Operator sees? |
|---------|---------|-----------------|----------------|
| SKIP (operator/bot/service) | No | No | No |
| DISMISS (noise/casual) | Yes | No | No (audit only) |
| BUFFER -> timeout | Yes | No | No (audit only) |
| BUFFER -> escalated | Yes | Yes | Yes |
| CREATE TICKET | Yes | Yes | Yes |
| APPEND to ticket | Yes | Added to ticket | Yes |

---

## Failure Modes

| Scenario | Behavior |
|----------|----------|
| OpenAI API down | Layer 1 rules still work. Layer 2 messages are auto-created as tickets (fail-open). |
| OpenAI slow (>3 sec) | Timeout. Fall back to auto-create ticket without classification. |
| Bot server down | Telegram queues webhooks for up to 24h. On restart, process backlog. |
| Bot server down >24h | Telegram drops queued updates. Call `getUpdates` on restart. Alert admin. |
| Database down | Messages queued in memory (bounded buffer). Retry writes. |
| Dashboard reply fails to send to Telegram | Retry up to 3 times. Mark message as `delivery_failed`. Operator sees failure indicator. |

**Core principle: AI failure degrades quality, never availability. Tickets always get created.**

---

## Cost Estimates (Monthly)

Assuming ~1,000 messages/day across all channels, ~2,000 drivers.

| Item | Monthly Cost |
|------|-------------|
| Layer 1 rules (~55% of messages) | $0 |
| AI text classification (~25%) | ~$0.15 |
| AI image analysis (~10%) | ~$1.50 |
| AI video thumbnail analysis (~2%) | ~$0.30 |
| AI ticket enrichment (~200 tickets/day) | ~$0.30 |
| **Total AI cost** | **~$2.25/month** |

---

## Bot API Endpoints

The bot exposes these endpoints for the dashboard to call:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/webhook` | POST | Telegram webhook receiver |
| `/api/send-reply` | POST | Send operator reply to Telegram. Body: `{ ticket_id, message_text, reply_to_message_id? }` |
| `/api/health` | GET | Health check |
