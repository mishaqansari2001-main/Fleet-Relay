# PRD-04: Scoring & Gamification

## Overview

Operators earn points by resolving tickets. Each ticket is assigned a **score category** on resolution — a predefined task type with a fixed point value. Scores are tracked daily, aggregated monthly, and directly determine operator pay. A leaderboard provides individual rankings and team competition.

---

## Score Categories

### Definition

A score category represents a type of task/work performed when resolving a ticket.

| Field | Description |
|-------|-------------|
| name | Display name (e.g., "Break", "Break + shift change") |
| points | Integer point value (e.g., 1, 2, 5) |
| is_active | Whether this category is currently available for selection |

### Management

- Score categories are **predefined by the admin** (the client already has an established list).
- The admin can:
  - **Add** new categories.
  - **Edit** existing categories (rename, change point value).
  - **Deactivate** categories (remove from selection without deleting — historical data preserved).
  - **Reactivate** deactivated categories.
- Point value changes apply **going forward only** — previously resolved tickets retain the point value from when they were resolved.
- The full task list with scores will be provided by the client and loaded during initial setup.

### Example Categories

These are illustrative examples. The actual list comes from the client.

| Category | Points |
|----------|--------|
| Break | 1 |
| Break + shift change | 2 |
| Document request | 3 |
| Payment issue | 3 |
| Breakdown assistance | 5 |
| Road hazard report | 4 |
| Complaint handling | 3 |

---

## Scoring Flow

### When an Operator Resolves a Ticket

1. Operator clicks **Resolve** on a ticket.
2. A modal/dialog appears with the list of active score categories.
3. Operator selects **one** category that best describes the work done.
4. The ticket is marked as `resolved`.
5. The points from the selected category are credited to the operator.
6. A `score_entry` record is created linking the ticket, operator, category, and points.

### When an Operator Dismisses a Ticket

- No score category is selected.
- No points awarded.
- The ticket is marked as `dismissed`.

### Point Rules

- **One category per ticket** — operator picks the single best-fit category.
- If multiple task types apply, operator picks the **highest-scoring** applicable category.
- **No bonuses** — points are exactly as defined in the category.
- **No penalties or negative points** — scoring is purely additive.
- **No partial credit** — either the ticket is resolved with a category or it's not.

---

## Score Tracking

### Daily Tracking

Each score entry records the **date** it was earned. This allows daily breakdowns.

| Data Point | Description |
|------------|-------------|
| Operator daily score | Sum of all points earned by an operator on a given day |
| Operator monthly score | Sum of all points earned by an operator in a calendar month |
| Team daily score | Sum of all operator daily scores in that team |
| Team monthly score | Sum of all operator monthly scores in that team |

### Monthly Reset

- The leaderboard operates on a **monthly cycle**.
- At the start of each month, the leaderboard rankings start fresh (all operators begin at 0).
- Historical data is **retained** — admins can view past months' data for pay calculation and trend analysis.
- The "current month" is always the active leaderboard period.

---

## Leaderboard

### Individual Leaderboard

A ranked list of all operators by their current month's total score.

| Rank | Operator | Score | Team |
|------|----------|-------|------|
| 1 | Operator A | 142 | Team Alpha |
| 2 | Operator B | 128 | Team Beta |
| 3 | Operator C | 115 | Team Alpha |
| ... | ... | ... | ... |

### Team Leaderboard

A ranked list of all teams by their current month's total score.

| Rank | Team | Score | Members |
|------|------|-------|---------|
| 1 | Team Alpha | 412 | 3 |
| 2 | Team Beta | 389 | 3 |
| 3 | Team Gamma | 356 | 3 |
| 4 | Team Delta | 301 | 3 |

Team score = sum of individual scores of all operators in the team.

---

## Visibility Rules

### What Operators See

| Data | Visible? |
|------|----------|
| Their own current score | Yes |
| Their own rank on the leaderboard | Yes |
| Other operators' ranks (positions) | Yes |
| Other operators' exact scores | **No** |
| Team rankings | Yes |
| Team scores (their own team's total) | Yes |
| Other teams' exact scores | **No** |
| Score categories and point values | Yes (they select them when resolving) |

**Leaderboard display for operators:**

```
Individual Leaderboard — January 2026

  #1  Alisher M.        Team Alpha
  #2  You               47 pts       Team Beta
  #3  Rustam K.         Team Alpha
  #4  Dilshod T.        Team Gamma
  ...
```

The operator sees their own score next to their name. Other operators show rank and name only, no score.

### What Admins See

Admins see **everything**: all operators' exact scores, all team scores, daily breakdowns, historical data across months.

---

## Gamification Visuals

### Dashboard Widgets (Admin View)

1. **Individual Leaderboard** — Ranked list with operator names, scores, team badges. Visual bars showing relative performance.
2. **Team Leaderboard** — Ranked list with team names and total scores. Visual comparison (bar chart or progress bars).
3. **Top Performer Highlight** — The #1 operator prominently featured.
4. **Monthly Progress** — Chart showing score accumulation over the current month (line or area chart).

### Dashboard Widgets (Operator View)

1. **My Score** — Current month's total points, prominently displayed.
2. **My Rank** — Position on the leaderboard with a visual indicator (e.g., medal for top 3).
3. **Individual Leaderboard** — Ranked list showing all operators' positions (own score visible, others' scores hidden).
4. **Team Standings** — Team rankings with own team highlighted.

---

## Admin Settings: Score Categories Page

Located at `/dashboard/settings/scoring`.

### Layout

- Table listing all score categories.
- Columns: Name, Points, Status (Active/Inactive), Actions.
- **Add Category** button.
- Inline editing or modal for editing name/points.
- Toggle for active/inactive.
- Cannot delete a category that has been used — only deactivate.

---

## Database Tables (Scoring-Related)

### `score_categories`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | |
| name | text | Display name |
| points | integer | Point value |
| is_active | boolean (default true) | Whether selectable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `score_entries`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | |
| ticket_id | uuid (FK -> tickets, unique) | One entry per ticket |
| operator_id | uuid (FK -> users) | Operator who resolved |
| score_category_id | uuid (FK -> score_categories) | Selected category |
| points | integer | Points at time of resolution (snapshot) |
| scored_date | date | Date the score was earned |
| created_at | timestamptz | |

**Note:** `points` is stored as a snapshot so that future changes to category point values do not retroactively change historical scores.
