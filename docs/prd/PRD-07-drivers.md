# PRD-07: Drivers

## Overview

Driver profiles are automatically created when a driver first contacts support via Telegram. Operators and admins can view driver information, ticket history, and attach persistent notes that carry across tickets and shifts.

---

## Driver Profile Creation

### Auto-Creation

When the Telegram bot receives a message from a driver who does not yet exist in the database:

1. A new driver record is created using data from the Telegram message:
   - `telegram_user_id` (permanent, unique identifier)
   - `first_name`
   - `last_name` (if available)
   - `username` (if available)
2. `first_seen_at` is set to the current timestamp.
3. The same `telegram_user_id` is recognized across all groups and DM channels — one driver, one profile.

### Auto-Update

On every subsequent message from a known driver:
- `last_seen_at` is updated.
- `first_name`, `last_name`, `username` are updated if they changed on Telegram.

### No Manual Creation

Drivers are never created manually in the dashboard. All drivers enter the system via Telegram contact.

---

## Driver Profile Fields

| Field | Source | Editable by Operators |
|-------|--------|----------------------|
| Full name | Telegram (first_name + last_name) | No (auto-synced from Telegram) |
| Username | Telegram | No (auto-synced) |
| Telegram User ID | Telegram | No |
| First seen | System timestamp | No |
| Last seen | System timestamp | No |
| Total tickets | Computed from tickets table | No |
| Notes | Operators | Yes |

---

## Driver Notes

### Purpose

Driver notes provide **cross-ticket, cross-shift context** about a driver. When a new operator picks up a ticket from a driver, they can immediately see important notes from previous interactions.

### Use Cases

- A driver was in an accident — the next shift needs to know this driver has an ongoing urgent situation.
- A driver is a frequent complainer — context helps operators prepare.
- A driver has specific service requirements or preferences.
- Administrative notes: truck number, region, special arrangements.

### Behavior

- Any **operator or admin** can add a note to a driver's profile.
- Notes are **persistent** — they remain on the driver profile regardless of which ticket is open or closed.
- Notes are visible to **all operators and admins** who view that driver's profile.
- Notes are displayed in **reverse chronological order** (newest first).
- Each note shows: author name, timestamp, content.
- Notes **cannot be edited** after creation (to maintain audit integrity). They can be deleted by the author or an admin.

### Note vs Internal Ticket Note

| | Driver Note | Ticket Internal Note |
|---|-----------|---------------------|
| Attached to | Driver profile | Specific ticket |
| Visible on | Driver page + ticket detail sidebar | Ticket conversation thread |
| Persists across tickets | Yes | No (only on that ticket) |
| Use case | Long-term driver context | Ticket-specific notes |

---

## Drivers Page (`/dashboard/drivers`)

### Table View

A paginated table listing all drivers who have had at least one ticket.

| Column | Description |
|--------|-------------|
| Driver Name | Full name (first_name + last_name) |
| Username | Telegram @username (if available) |
| Total Tickets | Count of all tickets for this driver |
| Open Tickets | Count of currently open/in_progress tickets |
| Last Active | Relative timestamp of last message received |
| Notes | Indicator icon if driver has any notes |

### Sorting

| Sort | Default |
|------|---------|
| Last Active (newest first) | Default |
| Name (alphabetical) | Optional |
| Total Tickets (descending) | Optional |

### Search

- Search by driver name or username.
- Free text input, filters the table in real-time.

### Filters

| Filter | Options |
|--------|---------|
| Has open tickets | Yes / No / All |
| Has notes | Yes / No / All |

---

## Driver Detail View

Clicking a driver row opens a detail view (sheet or dedicated page).

### Layout

#### Header
- Driver name (large)
- Username
- Telegram User ID
- First seen / Last seen
- Total ticket count

#### Notes Section
- List of all notes in reverse chronological order.
- Each note: author, timestamp, content.
- **Add Note** input at the top.
- Delete button on own notes (and on all notes for admins).

#### Ticket History
- Chronological list of all tickets for this driver.
- Each entry: Ticket #, Status, Category, Summary, Created date, Resolved date, Assigned operator.
- Clicking a ticket opens the ticket detail view.

---

## Driver Context in Ticket Detail

When an operator opens a ticket detail view, the **sidebar** shows the driver's profile:

- Driver name
- Username
- First seen / last seen
- Total past tickets count
- **Driver notes** (if any) — displayed directly in the sidebar
- Quick link to full driver profile page

This ensures operators have immediate context about the driver without navigating away from the ticket.

---

## Database Tables (Driver-Related)

### `drivers`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | |
| telegram_user_id | bigint (UNIQUE) | Permanent Telegram identifier |
| first_name | text | From Telegram |
| last_name | text (nullable) | From Telegram |
| username | text (nullable) | From Telegram |
| first_seen_at | timestamptz | First message timestamp |
| last_seen_at | timestamptz | Most recent message timestamp |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `driver_notes`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | |
| driver_id | uuid (FK -> drivers) | |
| author_id | uuid (FK -> users) | Operator or admin who wrote the note |
| content | text | Note content |
| created_at | timestamptz | |

**Notes:**
- No `updated_at` — notes are immutable after creation.
- Deletion is a hard delete (no soft delete needed for notes).
