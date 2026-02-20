# PRD-03: Ticketing System

## Overview

Tickets are the core entity. They are automatically created from Telegram messages, claimed by operators, worked on through a conversation thread (with replies going back to Telegram), and resolved with a score category assignment.

---

## Ticket Lifecycle

```
                           +-- DISMISSED (false positive)
                           |
  [Bot creates] --> OPEN --+-- [Operator claims] --> IN_PROGRESS --> RESOLVED
                           |
                           +-- [30 min unclaimed] --> OPEN + URGENT flag
```

### Statuses

| Status | Description |
|--------|-------------|
| `open` | Ticket created by the bot. Waiting for an operator to claim it. |
| `in_progress` | An operator has claimed the ticket and is actively working on it. |
| `resolved` | Operator has resolved the ticket and selected a score category. |
| `dismissed` | Ticket was a false positive (not a real support request). No score awarded. |

### Transitions

| From | To | Triggered by |
|------|----|-------------|
| `open` | `in_progress` | Operator claims the ticket |
| `in_progress` | `resolved` | Operator resolves the ticket (must select score category) |
| `in_progress` | `dismissed` | Operator dismisses the ticket as a false positive |
| `in_progress` | `open` | Operator releases the ticket (unclaims it) |

- Tickets cannot skip statuses (e.g., cannot go directly from `open` to `resolved`).
- Only the operator who claimed a ticket can resolve, dismiss, or release it.
- Admins can perform any status transition on any ticket.

---

## Ticket Creation

Tickets are created automatically by the Telegram bot. See [PRD-02: Telegram Bot](./PRD-02-telegram-bot.md) for the classification pipeline.

Each ticket is created with:

| Field | Value |
|-------|-------|
| status | `open` |
| priority | `normal` (may be upgraded to `urgent` by AI enrichment or SLA timer) |
| source_type | `business_dm` or `group` |
| source_chat_id | Telegram chat ID |
| business_connection_id | Set for DM tickets, null for group tickets |
| driver_id | FK to the auto-created driver record |
| ai_summary | Populated async by AI enrichment |
| ai_category | Populated async by AI enrichment |
| ai_urgency | Populated async by AI enrichment (1-5) |
| ai_location | Populated async by AI enrichment |
| display_id | Auto-incremented human-readable ID (e.g., TKT-0001) |

---

## Ticket Claiming

- Operators manually claim tickets from the open queue.
- When an operator claims a ticket:
  - Status changes to `in_progress`.
  - `assigned_operator_id` is set.
  - `claimed_at` timestamp is recorded (used for time tracking).
- Only **one operator** can claim a ticket at a time.
- If an operator cannot handle a ticket, they can **release** it back to `open` (unclaim).
- Tickets **cannot be transferred** between operators. An operator must release it, and another operator claims it.

---

## SLA & Urgency Escalation

### Urgency Timer

- A configurable time limit determines how long a ticket can remain unclaimed before being escalated.
- **Default: 30 minutes.**
- Configurable by admin in Settings.

### Escalation Behavior

When a ticket has been `open` (unclaimed) for longer than the configured threshold:

1. The ticket's `is_urgent` flag is set to `true`.
2. The ticket row in the dashboard receives a **visual urgency indicator** (red highlight, urgent badge).
3. The ticket is **not auto-assigned** — it remains in the open queue, but is visually prominent so operators notice it.
4. No notifications are sent (out of scope for initial build).

### Priority Field

| Priority | Description |
|----------|-------------|
| `normal` | Default. Standard processing. |
| `urgent` | Elevated by SLA timer (unclaimed > threshold) OR by AI enrichment (urgency 4-5). |

---

## Ticket Conversation Thread

Each ticket has a conversation thread composed of `ticket_messages`. These messages represent the back-and-forth between the driver and operator.

### Message Types

| Direction | Sender Type | Description |
|-----------|-------------|-------------|
| `inbound` | `driver` | Message from the driver (via Telegram) |
| `outbound` | `operator` | Reply from the operator (sent via dashboard, delivered to Telegram) |
| `inbound` | `system` | System-generated events (ticket created, AI enrichment completed, etc.) |

### Message Content Types

| Type | Description |
|------|-------------|
| `text` | Plain text message |
| `photo` | Image with optional AI-generated description |
| `video` | Video with thumbnail (stored, not transcribed) |
| `voice` | Audio message (stored, playable in dashboard, not transcribed) |
| `document` | PDF or other file attachment |
| `location` | GPS coordinates with reverse-geocoded address |

### Internal Notes

- Operators can add **internal notes** to a ticket.
- Internal notes are `ticket_messages` with `is_internal_note: true`.
- Internal notes are **NOT sent to Telegram** — they are visible only in the dashboard.
- All operators and admins can see internal notes on a ticket.
- Use case: context for shift handoffs, research notes, escalation details.

---

## Ticket Resolution

When an operator resolves a ticket, they must:

1. **Select a score category** from a predefined list (e.g., "Break", "Break + shift change", etc.).
2. This is a **single selection** — one score category per ticket.
3. The points associated with that category are credited to the operator.
4. The ticket status changes to `resolved`.
5. `resolved_at` timestamp is recorded.

If the operator determines the ticket is a false positive (not a real support request):
1. They select **Dismiss** instead of resolving.
2. Status changes to `dismissed`.
3. No score category is selected and no points are awarded.
4. `dismissed_at` timestamp is recorded.

---

## Ticket Detail View

The ticket detail view is the primary workspace for operators. It shows:

### Header
- Display ID (TKT-0001)
- Status badge
- Priority indicator
- Source (DM: Account Name or Group: Group Name)
- AI-generated summary (if available)
- AI-assigned category (if available)
- Created timestamp
- SLA countdown (if unclaimed)

### Conversation Thread
- Chronological list of all messages (inbound + outbound + internal notes)
- Each message shows: sender name, timestamp, content
- Media rendered inline: photos with AI descriptions, audio players, video players, document previews
- Internal notes visually distinguished (different background color)

### Reply Input
- Text input field
- **Send** button — sends reply to driver via Telegram
- **Internal Note** toggle — marks the message as internal-only (not sent to Telegram)

### Sidebar: Driver Info
- Driver name, username
- Telegram user ID
- First seen / last seen
- Total ticket count
- Driver notes (persistent, cross-ticket — see [PRD-07: Drivers](./PRD-07-drivers.md))

### Actions
- **Claim** (if ticket is open)
- **Release** (if operator claimed it and wants to unclaim)
- **Resolve** (opens score category selector)
- **Dismiss** (marks as false positive)

---

## Ticket List View (Queue)

The main ticket list shows all tickets accessible to the current user.

### Columns

| Column | Description |
|--------|-------------|
| Priority | Visual indicator (normal/urgent) |
| Ticket # | Display ID (TKT-0001) |
| Subject / Summary | AI-generated summary or first message preview |
| Source | DM or Group name |
| Operator | Assigned operator name, or "Unclaimed" |
| Created | Time since creation |
| SLA | Countdown timer for unclaimed tickets; handling time for claimed tickets |

### Filters

| Filter | Options |
|--------|---------|
| Status | Open, In Progress, Resolved, Dismissed |
| Priority | Normal, Urgent |
| Source | All, specific DM account, specific group |
| Operator | All, Unassigned, specific operator |

### Sorting

| Sort | Options |
|------|---------|
| Default | Urgent first, then by creation date (newest first) |
| Oldest first | By creation date ascending |
| SLA | By SLA deadline approaching |

### Operator View vs Admin View

- **Operators** see: all open tickets (for claiming) + their own claimed/resolved tickets.
- **Admins** see: all tickets across all operators and statuses.

---

## Database Tables (Ticket-Related)

### `tickets`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | |
| display_id | text | Human-readable ID (TKT-0001) |
| driver_id | uuid (FK -> drivers) | |
| source_type | enum: `business_dm`, `group` | |
| source_chat_id | bigint | Telegram chat ID |
| business_connection_id | text (nullable) | For DM tickets |
| status | enum: `open`, `in_progress`, `resolved`, `dismissed` | |
| priority | enum: `normal`, `urgent` | |
| is_urgent | boolean | Set by SLA timer |
| assigned_operator_id | uuid (FK -> users, nullable) | |
| score_category_id | uuid (FK -> score_categories, nullable) | Set on resolution |
| ai_summary | text (nullable) | AI-generated one-line summary |
| ai_category | text (nullable) | AI-assigned category |
| ai_urgency | int (nullable) | AI urgency score 1-5 |
| ai_location | text (nullable) | Extracted location |
| claimed_at | timestamptz (nullable) | When operator claimed |
| resolved_at | timestamptz (nullable) | When resolved |
| dismissed_at | timestamptz (nullable) | When dismissed |
| created_at | timestamptz | When bot created the ticket |
| updated_at | timestamptz | |

### `ticket_messages`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | |
| ticket_id | uuid (FK -> tickets) | |
| direction | enum: `inbound`, `outbound` | |
| sender_type | enum: `driver`, `operator`, `system` | |
| sender_name | text | Display name of sender |
| sender_user_id | uuid (nullable, FK -> users) | For operator messages |
| telegram_message_id | bigint (nullable) | For reply targeting |
| content_text | text (nullable) | |
| content_type | enum: `text`, `photo`, `voice`, `video`, `document`, `location` | |
| media_url | text (nullable) | Stored file URL |
| media_thumbnail_url | text (nullable) | |
| ai_media_description | text (nullable) | Vision AI output for media |
| is_internal_note | boolean (default false) | If true, not sent to Telegram |
| delivery_status | enum: `sent`, `delivered`, `failed` (nullable) | For outbound messages |
| created_at | timestamptz | |
