# FleetRelay Telegram Bot

Auto-creates support tickets from Telegram Business Account DMs and Group Chat messages for fleet/trucking companies.

## Architecture

```
Telegram Message
  │
  ▼
Layer 1: Deterministic Rules (~55%)
  │ keyword match, media detection, dismiss noise
  │
  ▼ (if undecided)
Layer 2: GPT-4o-mini (~45%)
  │ text classification, image analysis
  │
  ▼
Buffer (confidence 1-2) ──► 5 min timeout ──► silently dismiss
  │                              │
  │ (follow-up arrives)          │
  ▼                              │
Create Ticket ◄──────────────────┘
  │
  ▼
Async Enrichment (urgency, category, location, summary)
```

### Fail-Open Policy

If the AI call fails for any reason (timeout, quota, parse error), the message is treated as a ticket with `confidence=0` and `category=unclassified`. No driver message is ever lost due to AI failure.

## Setup

```bash
# 1. Install dependencies
pip install -e ".[dev]"

# 2. Copy environment template
cp .env.example .env
# Edit .env with your actual values

# 3. Run the server
uvicorn src.main:app --reload --port 8000
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/webhook` | Telegram webhook receiver |
| GET | `/health` | Health check + basic stats |
| GET | `/stats` | Detailed storage stats |
| GET | `/tickets` | List tickets (optional: `?status=open&driver_id=xyz`) |
| GET | `/tickets/{id}` | Get single ticket |
| GET | `/drivers` | List known drivers |

## Message Sources

- **Business Account DMs**: Messages from drivers to linked Telegram Business Accounts (uses `business_connection_id` from Bot API 7.2+)
- **Group Chats**: Messages in support groups (privacy mode OFF)

## Classification Categories

`mechanical` | `electrical` | `tire` | `fuel` | `accident` | `eld` | `documentation` | `other` | `unclassified`

## Project Structure

```
src/
├── main.py        # FastAPI entry point, webhook handler
├── bot.py         # Telegram bot setup, message routing
├── classifier.py  # Two-layer classification pipeline
├── models.py      # Pydantic models (Ticket, Driver, Message, etc.)
├── storage.py     # In-memory storage (swap for Supabase later)
└── config.py      # Pydantic Settings from env vars
```
