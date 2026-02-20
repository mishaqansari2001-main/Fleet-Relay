# PRD-06: Dashboard & Analytics

## Overview

The dashboard is the main interface for both admins and operators. It provides KPIs, charts, ticket management, and (for admins) full visibility into operator performance and gamification. The dashboard is role-aware — admins and operators see different views.

---

## Dashboard Layout

### Navigation (Sidebar)

| Item | Icon | Access |
|------|------|--------|
| Dashboard (Overview) | House | All |
| Tickets | Ticket | All |
| Drivers | Users | All |
| Leaderboard | Trophy | All |
| Settings | Gear | Admin only |

### Settings Sub-Pages (Admin Only)

| Sub-Page | Description |
|----------|-------------|
| General | Company name, SLA threshold, urgency timer |
| Teams | Create/edit teams, assign operators |
| Users | Approve signups, manage accounts, change roles |
| Scoring | Manage score categories and point values |
| Telegram | Manage connected business accounts and groups |

---

## Dashboard Overview Page (`/dashboard`)

### Admin View

The admin overview page is a command center showing the full state of operations.

#### KPI Cards (Top Row)

| KPI | Description | Computation |
|-----|-------------|-------------|
| Total Tickets | Total ticket count for the selected period | COUNT of tickets |
| Unresolved Tickets | Tickets currently in `open` or `in_progress` status | COUNT where status in (open, in_progress) |
| Avg Pickup Time | Average time from creation to first claim | AVG(claimed_at - created_at) |
| Avg Handling Time | Average time from claim to resolution | AVG(resolved_at - claimed_at) |

Each KPI card shows the current value and a small trend indicator (up/down compared to previous period).

#### Charts

**1. Ticket Volume (Area Chart)**
- X-axis: dates
- Y-axis: ticket count
- Shows total tickets created per day
- Time range toggle: **Last 15 days** / **Last 30 days**
- Smooth area fill with data points

**2. Resolved vs Unresolved (Donut Chart)**
- Shows the current ratio of resolved tickets to unresolved tickets (open + in_progress)
- Center shows total count
- Legend: Resolved, Open, In Progress, Dismissed

**3. Tickets by Source (Bar Chart)**
- Horizontal or vertical bar chart
- Breaks down ticket count by source: each DM account, each group
- Helps identify which channels generate the most support requests

**4. Tickets by AI Category (Bar Chart)**
- Bar chart showing ticket count by AI-assigned category
- Categories: breakdown, documents, payment, scheduling, road_hazard, complaint, other
- Useful for understanding what types of issues are most common

**5. Team Performance (Grouped Bar Chart)**
- Compares teams side-by-side
- Metrics per team: tickets resolved, average handling time, total score
- Allows admin to quickly see which team is outperforming

#### Open Tickets Section

Below the charts, a compact list of currently **open and in_progress** tickets:
- Shows the 10 most recent/urgent unresolved tickets
- Columns: Priority, Ticket #, Summary, Source, Operator, Created, SLA
- "View all" link goes to the full Tickets page filtered by unresolved status

#### Leaderboard Preview

A compact view of the top 5 operators and top team rankings:
- Shows rank, name, score, team
- "View full leaderboard" link goes to the Leaderboard page

---

### Operator View

Operators see a simplified dashboard focused on their own work.

#### KPI Cards (Top Row)

| KPI | Description |
|-----|-------------|
| My Score | Current month's total points |
| My Rank | Position on the individual leaderboard |
| Tickets Resolved Today | Count of tickets they resolved today |
| Avg Handling Time | Their own average handling time for the current period |

#### Charts

**1. My Tickets This Month (Area/Bar Chart)**
- Daily ticket resolution count over the current month
- Shows the operator's own productivity trend

**2. My Score Over Time (Line Chart)**
- Cumulative score over the current month
- Shows daily score accumulation

#### My Open Tickets

List of tickets currently assigned to this operator (status: `in_progress`):
- Priority, Ticket #, Summary, Driver, Claimed time ago

#### Recent Resolved

List of tickets recently resolved by this operator:
- Ticket #, Summary, Score Category, Points, Resolved time ago

---

## Tickets Page (`/dashboard/tickets`)

See [PRD-03: Ticketing System](./PRD-03-ticketing-system.md) for full ticket list and detail specifications.

### Summary

- Table of all tickets with columns: Priority, Ticket #, Subject, Source, Operator, Created, SLA
- Filters: Status, Priority, Source, Operator
- Clicking a row opens the ticket detail (sheet or dedicated page)
- Operator view: shows open queue + own tickets
- Admin view: shows all tickets

---

## Drivers Page (`/dashboard/drivers`)

See [PRD-07: Drivers](./PRD-07-drivers.md) for full specifications.

### Summary

- Table of all drivers who have had tickets
- Columns: Driver Name, Username, Total Tickets, Last Active, Notes indicator
- Clicking a row opens the driver detail view
- Shows driver profile, ticket history, and persistent notes

---

## Leaderboard Page (`/dashboard/leaderboard`)

Dedicated page for the full gamification view.

### Individual Leaderboard

Full ranked list of all operators for the current month.

**Admin view:**
| Rank | Operator | Team | Score | Tickets Resolved |
|------|----------|------|-------|-----------------|
| 1 | Alisher M. | Team Alpha | 142 | 48 |
| 2 | Rustam K. | Team Alpha | 128 | 41 |
| ... | ... | ... | ... | ... |

**Operator view:**
| Rank | Operator | Team | Score |
|------|----------|------|-------|
| 1 | Alisher M. | Team Alpha | — |
| 2 | You | Team Beta | 47 |
| 3 | Rustam K. | Team Alpha | — |

(Operators see their own score; other operators' scores are hidden.)

### Team Leaderboard

| Rank | Team | Total Score | Members | Avg Score/Member |
|------|------|-------------|---------|-----------------|
| 1 | Team Alpha | 412 | 3 | 137.3 |
| 2 | Team Beta | 389 | 3 | 129.7 |
| ... | ... | ... | ... | ... |

**Visibility:** Operators see team rankings and their own team's score. Other teams' exact scores are hidden.

### Visual Elements

- **Progress bars** showing relative performance (longest bar = highest scorer).
- **Top 3 highlight** — visual distinction for the top 3 operators (e.g., gold/silver/bronze accent).
- **Own-rank highlight** — the current user's row is visually emphasized.
- **Month selector** — admin can view past months. Operators see current month only.

---

## Settings Pages (`/dashboard/settings`) — Admin Only

### General Settings

| Setting | Type | Default |
|---------|------|---------|
| Company name | text | — |
| SLA urgency threshold | minutes | 30 |

### Teams Settings

- List of teams with member count
- Create new team
- Rename team
- Assign/remove operators
- Delete team (only if empty)

### Users Settings

- List of all users (active + pending + deactivated)
- Approve/reject pending signups
- Deactivate/reactivate accounts
- Change user roles

### Scoring Settings

- List of score categories with point values
- Add new category
- Edit name and points
- Activate/deactivate categories

### Telegram Settings

- List of connected business accounts
- List of connected groups
- Status of bot connection
- Connection instructions / bot token management

---

## Time Range Controls

Charts and KPIs support time range selection where applicable:

| Range | Description |
|-------|-------------|
| Today | Current day |
| Last 7 days | Rolling 7-day window |
| Last 15 days | Rolling 15-day window |
| Last 30 days | Rolling 30-day window |
| This month | Current calendar month |

Default: **Last 15 days** for charts, **This month** for leaderboard and scoring.

---

## Realtime Updates

The dashboard uses Supabase Realtime to receive live updates:

| Event | Dashboard Behavior |
|-------|-------------------|
| New ticket created | Appears in open ticket list; KPI counts update |
| Ticket claimed | Operator name appears on ticket row; status updates |
| Ticket resolved | Moves to resolved; score and leaderboard update |
| New message on a ticket | Badge/indicator on the ticket row; conversation thread updates in detail view |
| Score entry created | Leaderboard positions may shift |

Implementation: Subscribe to `postgres_changes` on `tickets`, `ticket_messages`, and `score_entries` tables. On event, call `router.refresh()` to re-fetch server data.
