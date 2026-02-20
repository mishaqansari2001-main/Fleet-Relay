# PRD-05: Performance Tracking

## Overview

Performance tracking gives the admin visibility into operator productivity. The system tracks **ticket pickup time** (how long until an operator claims a ticket), **handling time** (how long from claim to resolution), and **estimated daily work hours** (total handling time per day). This data is for **reporting and visibility only** — no automated enforcement, no alerts, no penalties.

---

## Metrics

### 1. Ticket Pickup Time

**Definition:** Time elapsed from ticket creation (by the bot) to an operator claiming it.

```
pickup_time = claimed_at - created_at
```

| Scope | Calculation |
|-------|-------------|
| Per ticket | `claimed_at - created_at` |
| Per operator (average) | Average pickup time across all tickets claimed by this operator in a period |
| Global average | Average pickup time across all tickets in a period |

**Notes:**
- Only calculated for tickets that have been claimed (`claimed_at` is not null).
- Tickets that are dismissed also count (they were still claimed first).
- If an operator releases a ticket and another operator claims it, the pickup time is calculated from the original creation to the final claim.

### 2. Ticket Handling Time

**Definition:** Time elapsed from an operator claiming a ticket to resolving or dismissing it.

```
handling_time = resolved_at (or dismissed_at) - claimed_at
```

| Scope | Calculation |
|-------|-------------|
| Per ticket | `resolved_at - claimed_at` or `dismissed_at - claimed_at` |
| Per operator (average) | Average handling time across all tickets resolved/dismissed by this operator in a period |
| Global average | Average handling time across all tickets resolved/dismissed in a period |

**Notes:**
- This is wall-clock time (Option A from requirements). If the operator claims a ticket at 9:00 AM and resolves it at 9:45 AM, handling time = 45 minutes, even if 30 minutes was spent waiting for the driver to reply.
- This is explicitly the desired behavior — waiting time counts as work time.
- Dismissed tickets (false positives) have handling time too, but can be filtered separately in reports.

### 3. Estimated Daily Work Hours

**Definition:** The total handling time of all tickets resolved or dismissed by an operator on a given day.

```
daily_work_hours = SUM(handling_time) for all tickets resolved/dismissed by this operator today
```

| Example |
|---------|
| Operator A resolved 6 tickets today. Total handling time: 4h 23m. Expected work day: 8 hours. |

**Notes:**
- This is an **estimate**, not a strict time clock. It shows how much ticket-based work the operator did.
- The 8-hour expected work day is a **reference point**, not a hard threshold. The system does not flag or penalize operators for being under or over.
- Admins can see this metric and draw their own conclusions.
- If an operator has a ticket open overnight (claimed at 11 PM, resolved at 7 AM next day = 8 hours), the handling time is attributed to the day the ticket was resolved.

### 4. Tickets Resolved Count

**Definition:** Number of tickets resolved (not dismissed) by an operator in a period.

| Scope | Description |
|-------|-------------|
| Daily | Tickets resolved today |
| Weekly | Tickets resolved this week |
| Monthly | Tickets resolved this month |

---

## Data Visibility

### Admin Dashboard

The admin has a **Performance** section or tab showing:

| Widget | Description |
|--------|-------------|
| Operator Performance Table | Table of all operators with columns: Name, Team, Tickets Resolved (today/month), Avg Pickup Time, Avg Handling Time, Est. Work Hours Today |
| Team Performance Summary | Aggregated metrics per team |
| Avg Pickup Time (global) | Single KPI card showing the global average |
| Avg Handling Time (global) | Single KPI card showing the global average |
| Trend Charts | Line/area charts showing metrics over time (daily averages over the past 15-30 days) |

### Operator Dashboard

Operators see **their own metrics only**:

| Widget | Description |
|--------|-------------|
| My Tickets Today | Number of tickets resolved today |
| My Avg Handling Time | Their own average handling time |
| My Est. Work Hours Today | Their own estimated daily work hours |

Operators **cannot** see other operators' performance metrics.

---

## Time Period Filters

All performance metrics support these time period views:

| Period | Description |
|--------|-------------|
| Today | Current day |
| This week | Current calendar week |
| This month | Current calendar month |
| Last 15 days | Rolling 15-day window |
| Last 30 days | Rolling 30-day window |
| Custom range | Admin can select start and end dates |

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Ticket claimed but never resolved (still in_progress) | Not included in handling time calculations. Shows as "in progress" in the ticket list. |
| Ticket released (unclaimed after being claimed) | The time the first operator held it is not counted as handling time for anyone. Only the final resolver gets handling time credited. |
| Ticket resolved after midnight (spans two days) | Handling time is attributed to the day it was resolved. |
| Operator has no tickets on a day | Daily work hours = 0. They simply don't appear in that day's metrics (or show as 0). |
| Dismissed ticket | Handling time is calculated but can be filtered out of reports. Admins may want to see it separately. |

---

## No Automated Enforcement

To reiterate: the performance tracking system is **purely for visibility and reporting**. It does not:

- Flag operators for low productivity.
- Send alerts when work hours are below a threshold.
- Automatically escalate or reassign tickets based on performance.
- Restrict operators from claiming tickets based on performance.
- Display warnings or messages to operators about their productivity.

The admin views the data and makes their own management decisions outside the system.

---

## Database Views / Computed Fields

These metrics are computed from existing data on `tickets` and `score_entries`. No new tables are needed, but the following **database views** or **computed queries** are recommended for the dashboard:

### `operator_daily_stats` (view)

| Column | Computation |
|--------|-------------|
| operator_id | |
| date | |
| tickets_resolved | COUNT of tickets resolved on this date |
| tickets_dismissed | COUNT of tickets dismissed on this date |
| avg_pickup_time_minutes | AVG(claimed_at - created_at) for tickets claimed on this date |
| avg_handling_time_minutes | AVG(resolved_at - claimed_at) for tickets resolved on this date |
| total_handling_time_minutes | SUM(resolved_at - claimed_at) for tickets resolved on this date |
| total_points | SUM of points from score_entries on this date |

### `team_daily_stats` (view)

| Column | Computation |
|--------|-------------|
| team_id | |
| date | |
| tickets_resolved | SUM of team members' tickets resolved |
| avg_pickup_time_minutes | AVG across team members |
| avg_handling_time_minutes | AVG across team members |
| total_points | SUM of team members' points |
