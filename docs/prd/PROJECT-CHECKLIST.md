# FleetRelay — Project Checklist

## Non-Negotiable Design Guidelines

These guidelines apply to **every phase** and **every UI task** without exception.

1. **Overall style**: Modern, elegant, functional, professional. Inspired by **Notion** — clean layout, excellent spacing, subtle accents, calm refined aesthetic. No generic "AI slop."
2. **Agent usage**: Every UI task **must** use the `/frontend-design` agent. No exceptions.
3. **Dashboard feel**: Contemporary SaaS product. Thoughtful whitespace, hierarchy, alignment. Clearly separated but visually cohesive sections. No clutter, no noisy borders.
4. **Buttons**: Clear primary/secondary hierarchy. Smooth modern hover states (subtle background change, elevation, or border shifts). No flashy, cartoonish, or oversaturated styles.
5. **Tables**: Clean, minimal, well-organized. Consistent column alignment, subtle row separators, clear headers. No heavy borders. Use spacing, light dividers, and typography for structure.
6. **Typography**: Readability first. Modern sans-serif (Geist Sans/Mono). Clear hierarchy of sizes, weights, spacing. No low-contrast text, no tiny fonts. Headings, labels, and body must be legible and distinct.
7. **Polish**: Deliberate, consistent spacing. Subtle, professional colors. Aligned icons, labels, and components. No neon, no random bright colors.
8. **Icons**: Phosphor Icons only. No Lucide, Heroicons, or others.
9. **No emojis** anywhere in the UI.
10. **Graphite design system** colors (see CLAUDE.md) for all surfaces, borders, text, and accents.

---

## Phase 0: Reset & Cleanup

Clear the slate. Keep only what carries forward.

### 0.1 — Codebase Cleanup
- [ ] **Back up the current project** (git commit or archive)
- [ ] **Keep** the landing page (`app/src/app/(marketing)/` or root marketing page)
- [ ] **Keep** `app/src/app/layout.tsx` (root layout with fonts, metadata)
- [ ] **Keep** `app/src/components/ui/` (shadcn/ui primitives — Button, Dialog, Input, etc.)
- [ ] **Keep** `app/src/lib/supabase/client.ts` and `server.ts` (Supabase client helpers)
- [ ] **Keep** `tailwind.config.ts`, `next.config.ts`, `package.json`, `tsconfig.json`
- [ ] **Delete** all existing dashboard pages (`app/src/app/dashboard/**`)
- [ ] **Delete** existing auth pages (`app/src/app/(auth)/**`)
- [ ] **Delete** `app/src/lib/types.ts` (will be rebuilt from new schema)
- [ ] **Delete** `app/src/lib/supabase/types.ts` (will be regenerated from new schema)
- [ ] **Delete** `app/src/middleware.ts` (will be rebuilt for new auth flow)
- [ ] **Delete** any existing test files tied to old schema
- [ ] **Audit remaining files** — remove anything that references the old schema or old components

### 0.2 — Supabase Reset
- [ ] **Create a new Supabase project** (fresh database, fresh auth)
- [ ] **Record** the new project ID, URL, anon key, and service role key
- [ ] **Update** `.env.local` with new Supabase credentials
- [ ] **Update** Supabase client helpers if URLs/keys are hardcoded anywhere
- [ ] **Verify** the Supabase client connects successfully (quick test query)

### 0.3 — Telegram Bot Audit
- [ ] **Review** existing bot code in `telegram-bot/src/`
- [ ] **Decide** what to keep vs rewrite based on new schema (ticket_messages replaces ticket_events, new driver table shape, new message types)
- [ ] **Update** bot's Supabase connection to point to the new project
- [ ] **Note** any bot logic that needs to change (list it, don't implement yet)

---

## Phase 1: Database Foundation

Set up the entire Supabase schema before writing any frontend code.

### 1.1 — Enums & Core Types
- [ ] Create migration: all custom enums (`user_role`, `user_status`, `ticket_status`, `ticket_priority`, `ticket_source`, `message_direction`, `message_sender_type`, `message_content_type`, `message_delivery_status`, `telegram_connection_type`)

### 1.2 — Tables
- [ ] Create migration: `teams` table
- [ ] Create migration: `users` table (references auth.users)
- [ ] Create migration: `drivers` table
- [ ] Create migration: `driver_notes` table
- [ ] Create migration: `score_categories` table
- [ ] Create migration: `tickets` table with `display_id` sequence and function
- [ ] Create migration: `ticket_messages` table
- [ ] Create migration: `score_entries` table
- [ ] Create migration: `telegram_connections` table
- [ ] Create migration: `raw_messages` table
- [ ] Create migration: `settings` table with default values (sla_urgency_threshold_minutes = 30, company_name = "FleetRelay")

### 1.3 — Functions & Triggers
- [ ] Create `handle_updated_at()` trigger function
- [ ] Apply `updated_at` triggers to all relevant tables
- [ ] Create `handle_new_user()` trigger on `auth.users` insert (with first-user-is-admin bootstrap logic)
- [ ] Create `next_ticket_display_id()` function (TKT-0001 sequence)
- [ ] Create `check_ticket_urgency()` function (flags unclaimed tickets past SLA threshold)

### 1.4 — Views
- [ ] Create `operator_daily_stats` view
- [ ] Create `team_monthly_stats` view
- [ ] Create `leaderboard_current_month` view

### 1.5 — Indexes
- [ ] Verify all indexes from PRD-08 are created (on tickets.status, tickets.driver_id, tickets.assigned_operator_id, tickets.created_at, etc.)

### 1.6 — Row Level Security
- [ ] Enable RLS on all tables
- [ ] Create RLS policies for `users` (SELECT: all authenticated; UPDATE: own row + admin)
- [ ] Create RLS policies for `tickets` (SELECT: admin=all, operator=open+own; UPDATE: own+admin; INSERT: service role)
- [ ] Create RLS policies for `ticket_messages` (SELECT: based on parent ticket access; INSERT: operator on own tickets + service role)
- [ ] Create RLS policies for `score_entries` (SELECT: admin=all, operator=own; INSERT: via resolution logic)
- [ ] Create RLS policies for `score_categories` (SELECT: all authenticated; INSERT/UPDATE: admin)
- [ ] Create RLS policies for `drivers` (SELECT: all authenticated; INSERT/UPDATE: service role)
- [ ] Create RLS policies for `driver_notes` (SELECT: all; INSERT: all; DELETE: own+admin)
- [ ] Create RLS policies for `settings` (SELECT: all; UPDATE: admin)
- [ ] Create RLS policies for `raw_messages` (SELECT: admin; INSERT: service role)
- [ ] Create RLS policies for `telegram_connections` (SELECT: admin; INSERT/UPDATE: admin)
- [ ] Create RLS policies for `teams` (SELECT: all; INSERT/UPDATE/DELETE: admin)

### 1.7 — Realtime
- [ ] Enable Realtime on `tickets` (INSERT, UPDATE)
- [ ] Enable Realtime on `ticket_messages` (INSERT)
- [ ] Enable Realtime on `score_entries` (INSERT)

### 1.8 — Storage
- [ ] Create `ticket-media` bucket (private, 50MB limit, image/video/audio/pdf)

### 1.9 — Type Generation
- [ ] Run Supabase type generation
- [ ] Save generated types to `app/src/lib/supabase/types.ts`
- [ ] Create `app/src/lib/types.ts` with app-level type aliases, enums, configs, and helpers (based on new schema)

### 1.10 — Seed Data
- [ ] Create seed script: 1 admin user, 4 teams, 12 operators (3 per team)
- [ ] Create seed script: 5-10 score categories with point values
- [ ] Create seed script: 20-30 drivers
- [ ] Create seed script: 50-100 tickets across various statuses with realistic timestamps
- [ ] Create seed script: ticket_messages for each ticket (conversation threads)
- [ ] Create seed script: score_entries for resolved tickets
- [ ] **Verify** all seed data is accessible via Supabase queries

---

## Phase 2: Authentication & App Shell

### 2.1 — Auth Pages
- [ ] **`/signup`** — Signup form: full name, email, password, role toggle (admin/operator). Uses Supabase Auth `signUp` with user metadata. **Use /frontend-design.**
- [ ] **`/login`** — Login form: email, password. Validates credentials, checks account status (active/pending/rejected/deactivated). **Use /frontend-design.**
- [ ] **`/pending-approval`** — Shown to users with `pending_approval` status. Clean message explaining they need admin approval. **Use /frontend-design.**
- [ ] **`/auth/callback`** — Supabase auth callback route (email verification redirect)
- [ ] **Password reset flow** — Forgot password link on login, Supabase reset email, reset form

### 2.2 — Middleware
- [ ] Create `middleware.ts`: protect `/dashboard/**` routes
- [ ] Check for valid session; redirect to `/login` if no session
- [ ] Check `users.status` = `active`; redirect to `/pending-approval` if pending
- [ ] Refresh session tokens on each request

### 2.3 — Dashboard Layout Shell
- [ ] **`/dashboard/layout.tsx`** — Dashboard layout with sidebar navigation. **Use /frontend-design.**
  - [ ] Sidebar with navigation items: Dashboard, Tickets, Drivers, Leaderboard
  - [ ] Settings nav item (visible only to admins)
  - [ ] User profile section at bottom of sidebar (name, role, logout)
  - [ ] Responsive: collapsible sidebar on smaller screens
  - [ ] Phosphor Icons for all nav items
  - [ ] Active state highlighting on current route
  - [ ] Graphite design system colors throughout

### 2.4 — Role-Based Access
- [ ] Create a `useUser` hook or server-side helper that returns current user + role
- [ ] Create a role guard component/utility for admin-only sections
- [ ] Verify operators cannot access `/dashboard/settings/**`
- [ ] Verify pending users cannot access any `/dashboard/**` route

---

## Phase 3: Tickets — Core Feature

The most critical feature. Build thoroughly.

### 3.1 — Tickets List Page (`/dashboard/tickets`)
- [ ] **Server component** `page.tsx`: fetch tickets, operators from Supabase
- [ ] **Client component** `tickets-client.tsx`: interactive ticket list. **Use /frontend-design.**
  - [ ] Table with columns: Priority, Ticket #, Subject/Summary, Source, Operator, Created, SLA
  - [ ] Clean single-line rows, compact but readable
  - [ ] Priority: visual indicator (dot or icon with color)
  - [ ] Status filter tabs or dropdown: Open, In Progress, Resolved, Dismissed, All
  - [ ] Priority filter: All, Normal, Urgent
  - [ ] Source filter: All, DM accounts, specific groups
  - [ ] Operator filter: All, Unassigned, specific operator
  - [ ] Sort options: Newest, Oldest, SLA deadline
  - [ ] Urgent tickets visually distinguished (red accent or badge)
  - [ ] Pagination (15-20 items per page)
  - [ ] Search by ticket # or subject text
  - [ ] Empty state design
- [ ] **Admin view**: all tickets visible
- [ ] **Operator view**: open queue + own claimed tickets
- [ ] **Realtime subscription**: new tickets appear live, status changes reflected

### 3.2 — Ticket Detail View
- [ ] **Decide**: Sheet (slide-in panel) or dedicated page. Recommendation: Sheet for quick view from list, with "Open full page" option.
- [ ] **Use /frontend-design** for the entire detail view.
  - [ ] **Header**: Display ID, status badge, priority, source label, AI summary, AI category, created timestamp
  - [ ] **Conversation thread**: Chronological messages (inbound from driver, outbound from operator, system events)
    - [ ] Text messages rendered cleanly
    - [ ] Photos rendered inline with AI description caption
    - [ ] Voice messages with audio player
    - [ ] Video messages with video player or thumbnail
    - [ ] Documents with download link and filename
    - [ ] Location with reverse-geocoded address text
    - [ ] Internal notes visually distinguished (different background, "Internal Note" label)
    - [ ] Each message: sender name, timestamp, content
  - [ ] **Reply input**: Text field + Send button + Internal Note toggle
    - [ ] Send triggers outbound message creation + Telegram delivery (Phase 5)
    - [ ] Internal Note toggle changes message to `is_internal_note: true` (not sent to Telegram)
  - [ ] **Sidebar — Driver Info**: Name, username, first/last seen, total tickets, driver notes (with "View full profile" link)
  - [ ] **Actions bar**:
    - [ ] "Claim" button (if ticket is open, operator claiming it)
    - [ ] "Release" button (if operator wants to unclaim)
    - [ ] "Resolve" button → opens score category selector modal
    - [ ] "Dismiss" button → confirmation dialog → marks as dismissed
- [ ] Score category selector modal:
  - [ ] List of active score categories with name and point value
  - [ ] Single selection (radio buttons or selectable list)
  - [ ] Confirm button → resolves ticket + creates score_entry

### 3.3 — Ticket Claiming Logic
- [ ] Implement claim flow: operator clicks Claim → `assigned_operator_id` set, `status` → `in_progress`, `claimed_at` set
- [ ] Implement release flow: operator clicks Release → `assigned_operator_id` nulled, `status` → `open`, `claimed_at` nulled
- [ ] Prevent double-claiming (optimistic lock or check before update)
- [ ] Verify only the assigned operator (or admin) can resolve/dismiss

### 3.4 — Ticket Resolution Logic
- [ ] Resolve flow: select score category → update ticket (`status` → `resolved`, `resolved_at`, `score_category_id`) → insert `score_entry` (operator_id, category_id, points snapshot, scored_date)
- [ ] Dismiss flow: confirmation dialog → update ticket (`status` → `dismissed`, `dismissed_at`)
- [ ] Verify points are snapshotted (stored on score_entry, not looked up from category)

### 3.5 — SLA & Urgency
- [ ] Implement urgency check: either via pg_cron calling `check_ticket_urgency()`, or compute on dashboard load
- [ ] Urgent tickets visually flagged in the list (red highlight, "Urgent" badge)
- [ ] SLA countdown display on unclaimed tickets (relative time since creation vs threshold)

---

## Phase 4: Drivers Page

### 4.1 — Drivers List (`/dashboard/drivers`)
- [ ] **Server component** `page.tsx`: fetch drivers with ticket counts
- [ ] **Client component** `drivers-client.tsx`. **Use /frontend-design.**
  - [ ] Table columns: Driver Name, Username, Total Tickets, Open Tickets, Last Active, Notes indicator (icon if has notes)
  - [ ] Search by name or username
  - [ ] Sort: Last Active (default), Name, Total Tickets
  - [ ] Filters: Has open tickets, Has notes
  - [ ] Clean, minimal table rows
  - [ ] Pagination

### 4.2 — Driver Detail View
- [ ] **Decide**: Sheet or dedicated page. Recommendation: Sheet from drivers list.
- [ ] **Use /frontend-design.**
  - [ ] **Header**: Driver name, username, Telegram user ID, first seen, last seen, total tickets
  - [ ] **Notes section**:
    - [ ] List of all driver notes (reverse chronological)
    - [ ] Each note: author name, timestamp, content
    - [ ] "Add Note" input at top
    - [ ] Delete button on own notes (admins can delete any)
  - [ ] **Ticket history**: List of all tickets for this driver
    - [ ] Each entry: Ticket #, Status, Category, Summary, Created, Resolved date, Operator
    - [ ] Clicking a ticket navigates to ticket detail

---

## Phase 5: Telegram Bot Integration

### 5.1 — Bot Core (Python/FastAPI)
- [ ] **Review and update** existing bot code for new schema
- [ ] Webhook endpoint (`/webhook`) receives all Telegram events
- [ ] Parse message types: text, photo, video, voice, document, location
- [ ] Extract sender info: `user_id`, `first_name`, `last_name`, `username`
- [ ] Detect source: business DM (via `business_connection_id`) vs group (via `chat_id`)

### 5.2 — Driver Upsert
- [ ] On every message, upsert driver record (create if new, update `last_seen_at` if existing)
- [ ] Use `telegram_user_id` as the unique key

### 5.3 — Classification Pipeline — Layer 1 (Deterministic Rules)
- [ ] Implement sender filter (skip operators, bots, service messages)
- [ ] Implement existing ticket check (reply-to matching, open ticket in same chat < 4 hours)
- [ ] Implement explicit signal check (@bot or @company mention)
- [ ] Implement noise rejection (emoji-only, short words, greeting patterns, reactions)
- [ ] Log all non-skip messages to `raw_messages`

### 5.4 — Classification Pipeline — Layer 2 (AI)
- [ ] Implement GPT-4o-mini text classification
- [ ] Implement GPT-4o-mini image/photo analysis
- [ ] Implement video thumbnail analysis (first frame)
- [ ] Implement auto-create for documents and locations
- [ ] Implement auto-create for voice messages
- [ ] Implement 5-minute buffer for low-confidence messages
- [ ] Implement buffer resolution (combine + re-classify or timeout dismiss)

### 5.5 — Ticket Creation
- [ ] Create ticket in database with correct `source_type`, `source_chat_id`, `business_connection_id`, `driver_id`
- [ ] Create initial `ticket_message` (the driver's message that triggered the ticket)
- [ ] Generate `display_id` via the sequence function
- [ ] Handle media: download from Telegram, upload to Supabase Storage, store URL on `ticket_message`

### 5.6 — AI Enrichment (Post-Creation)
- [ ] Async task after ticket creation
- [ ] Single GPT-4o-mini call for: urgency (1-5), category, location, summary
- [ ] Update ticket with AI fields
- [ ] If urgency >= 4, set `priority` to `urgent`

### 5.7 — Message Appending
- [ ] When a message matches an existing open ticket, create a new `ticket_message` (direction: inbound, sender_type: driver)
- [ ] Handle media attachments same as ticket creation
- [ ] Update ticket's `updated_at`

### 5.8 — Two-Way Messaging (Dashboard → Telegram)
- [ ] **Bot API endpoint** `POST /api/send-reply`: receives `ticket_id`, `message_text`
- [ ] Look up ticket's `source_type`, `source_chat_id`, `business_connection_id`
- [ ] **For DM tickets**: send via `sendMessage` with `business_connection_id`
- [ ] **For Group tickets**: send via `sendMessage` to `chat_id` with `reply_to_message_id` (driver's last message)
- [ ] Store the Telegram `message_id` of the sent message on the `ticket_message` record
- [ ] Handle delivery failures: retry up to 3 times, mark as `failed` if all retries fail
- [ ] **Dashboard integration**: when operator clicks Send in ticket detail, call the bot's `/api/send-reply` endpoint
- [ ] Create `ticket_message` record (direction: outbound, sender_type: operator) in database

### 5.9 — Gratitude Auto-Dismiss
- [ ] For DM tickets: if last ticket resolved < 24h ago and new message matches gratitude patterns → auto-dismiss, do not create ticket

### 5.10 — Failure Handling
- [ ] OpenAI down → fail-open (create ticket without AI data)
- [ ] OpenAI slow (>3s) → timeout, create ticket without classification
- [ ] Telegram delivery failure → retry with backoff, mark as failed
- [ ] Log all errors for debugging

---

## Phase 6: Scoring & Gamification

### 6.1 — Score Categories Admin Page (`/dashboard/settings/scoring`)
- [ ] **Use /frontend-design.**
- [ ] Table: Name, Points, Status (Active/Inactive), Actions
- [ ] Add Category: modal with name + points inputs
- [ ] Edit Category: inline edit or modal
- [ ] Activate/Deactivate toggle
- [ ] Cannot delete a used category (only deactivate)
- [ ] Admin-only access (redirect operators away)

### 6.2 — Resolution Score Selection
- [ ] When operator clicks "Resolve" on a ticket, show score category selector
- [ ] **Use /frontend-design** for the selector modal/dialog
- [ ] List of active categories: name + points
- [ ] Single selection
- [ ] Confirm → creates `score_entry` + resolves ticket

### 6.3 — Leaderboard Page (`/dashboard/leaderboard`)
- [ ] **Server component**: fetch leaderboard data (current month)
- [ ] **Client component**. **Use /frontend-design.**
- [ ] **Individual Leaderboard**:
  - [ ] Ranked list of all operators
  - [ ] Admin view: rank, name, team, score, tickets resolved
  - [ ] Operator view: rank, name, team (own score visible, others' hidden)
  - [ ] Progress bars showing relative performance
  - [ ] Top 3 visual highlight (gold/silver/bronze accent)
  - [ ] Own-rank row highlighted
- [ ] **Team Leaderboard**:
  - [ ] Ranked list of teams
  - [ ] Team name, total score, member count, avg score/member
  - [ ] Admin sees all scores; operators see rankings + own team score
  - [ ] Visual bars or progress indicators
- [ ] **Month selector** (admin only): view past months' leaderboards
- [ ] **Period display**: "January 2026" header showing current period

---

## Phase 7: Dashboard Overview

### 7.1 — Admin Dashboard (`/dashboard`)
- [ ] **Server component** `page.tsx`: fetch all KPIs, chart data, open tickets, leaderboard preview
- [ ] **Client component** `dashboard-client.tsx`. **Use /frontend-design.**
- [ ] **KPI Cards** (top row):
  - [ ] Total Tickets (period)
  - [ ] Unresolved Tickets (open + in_progress)
  - [ ] Avg Pickup Time
  - [ ] Avg Handling Time
  - [ ] Each card: value + trend indicator (up/down vs previous period)
- [ ] **Charts**:
  - [ ] Ticket Volume — Area chart, daily ticket count, toggle: last 15 days / last 30 days
  - [ ] Resolved vs Unresolved — Donut chart, current ratio
  - [ ] Tickets by Source — Bar chart, breakdown by DM account / group
  - [ ] Tickets by AI Category — Bar chart, breakdown by category
  - [ ] Team Performance — Grouped bar chart comparing teams
- [ ] **Open Tickets section**: compact list of 10 most urgent/recent unresolved tickets with "View all" link
- [ ] **Leaderboard Preview**: top 5 operators + team rankings with "View full leaderboard" link
- [ ] **Time range selector**: Today, Last 7 days, Last 15 days, Last 30 days, This month

### 7.2 — Operator Dashboard (`/dashboard`)
- [ ] **Conditionally render** based on role (same route, different component or conditional sections)
- [ ] **Use /frontend-design.**
- [ ] **KPI Cards**:
  - [ ] My Score (current month)
  - [ ] My Rank (leaderboard position)
  - [ ] Tickets Resolved Today
  - [ ] Avg Handling Time (own)
- [ ] **Charts**:
  - [ ] My Tickets This Month — Bar/area chart of daily resolution count
  - [ ] My Score Over Time — Line chart of cumulative score
- [ ] **My Open Tickets**: list of tickets assigned to this operator (in_progress)
- [ ] **Recent Resolved**: list of recently resolved tickets with score category and points

---

## Phase 8: Performance Tracking

### 8.1 — Admin Performance View
- [ ] **Decide**: separate page or section within dashboard. Recommendation: tab or section on the dashboard overview.
- [ ] **Use /frontend-design.**
- [ ] **Operator Performance Table**:
  - [ ] Columns: Operator Name, Team, Tickets Resolved (today/month), Avg Pickup Time, Avg Handling Time, Est. Work Hours Today
  - [ ] Sortable columns
  - [ ] Clean, minimal table design
- [ ] **Team Performance Summary**: aggregated metrics per team
- [ ] **Trend Charts**:
  - [ ] Avg Pickup Time over last 15/30 days (line chart)
  - [ ] Avg Handling Time over last 15/30 days (line chart)
- [ ] **Time period filter**: Today, This Week, This Month, Last 30 days, Custom range

### 8.2 — Operator Performance View
- [ ] Operators see only their own stats
- [ ] My Tickets Today count
- [ ] My Avg Handling Time
- [ ] My Est. Work Hours Today
- [ ] This is shown on the operator dashboard (Phase 7.2), not a separate page

---

## Phase 9: Settings & Admin Pages

### 9.1 — General Settings (`/dashboard/settings`)
- [ ] **Use /frontend-design.**
- [ ] Company name (editable text)
- [ ] SLA urgency threshold (minutes, editable number input)
- [ ] Save button with confirmation

### 9.2 — Teams Management (`/dashboard/settings/teams`)
- [ ] **Use /frontend-design.**
- [ ] List of teams with member count
- [ ] Create new team (name input + create button)
- [ ] Rename team (inline edit or modal)
- [ ] Delete team (only if no members; confirmation dialog)
- [ ] Assign operators to teams: select operator → select team
- [ ] Remove operator from team
- [ ] Visual: team cards or table with member list expandable

### 9.3 — User Management (`/dashboard/settings/users`)
- [ ] **Use /frontend-design.**
- [ ] **Pending Approvals** section: list of pending users with Approve/Reject buttons
  - [ ] Each: name, email, requested role, signup date
  - [ ] Approve → set status to active, confirm role
  - [ ] Reject → set status to rejected
- [ ] **Active Users** section: list of all active users
  - [ ] Each: name, email, role, team, status
  - [ ] Actions: Deactivate, Change Role
- [ ] **Deactivated Users** section: list with Reactivate option

### 9.4 — Scoring Settings (`/dashboard/settings/scoring`)
- [ ] Already covered in Phase 6.1

### 9.5 — Telegram Settings (`/dashboard/settings/telegram`)
- [ ] **Use /frontend-design.**
- [ ] List of connected business accounts (name, connection ID, status)
- [ ] List of connected groups (name, chat ID, status)
- [ ] Bot connection status indicator
- [ ] Instructions or setup guide for connecting new accounts/groups

---

## Phase 10: Polish, Testing & Launch Prep

### 10.1 — Visual Polish
- [ ] Review all pages against design guidelines (Notion-inspired, Graphite colors, no clutter)
- [ ] Verify consistent spacing, typography, and color usage across all pages
- [ ] Verify all hover states are smooth and professional
- [ ] Verify all tables follow the clean/minimal standard
- [ ] Verify all destructive actions have confirmation dialogs
- [ ] Verify empty states are designed (no blank screens)
- [ ] Verify loading states exist for all async operations
- [ ] Verify error states are handled gracefully (not raw error messages)
- [ ] Dark mode verification: all pages look correct in dark mode
- [ ] Light mode verification: all pages look correct in light mode

### 10.2 — Realtime Verification
- [ ] New ticket created by bot → appears in ticket list within 1-2 seconds
- [ ] Ticket claimed by operator → status updates live for other viewers
- [ ] Ticket resolved → leaderboard updates, dashboard KPIs refresh
- [ ] New message in ticket → conversation thread updates in detail view
- [ ] Score entry created → leaderboard shifts reflected

### 10.3 — End-to-End Testing
- [ ] **Auth flow**: signup → email verification → pending approval → admin approves → login → dashboard
- [ ] **Ticket flow**: Telegram message → bot creates ticket → operator sees in list → claims → replies (reply appears in Telegram) → driver replies back (appears in dashboard) → resolve with score category → score appears in leaderboard
- [ ] **Dismiss flow**: Telegram message → bot creates ticket → operator dismisses → no score
- [ ] **Urgency flow**: ticket unclaimed for > 30 min → urgent flag appears
- [ ] **Driver notes flow**: operator adds note to driver → other operator sees it on next ticket from same driver
- [ ] **Score categories**: admin creates/edits/deactivates categories → operators see updated list on resolve
- [ ] **Team management**: admin creates team, assigns operators, verifies team leaderboard
- [ ] **User management**: admin approves, rejects, deactivates, changes roles

### 10.4 — Security Audit
- [ ] Verify RLS: operator cannot see admin-only data
- [ ] Verify RLS: operator cannot modify other operators' tickets
- [ ] Verify RLS: pending users cannot access dashboard
- [ ] Verify RLS: deactivated users cannot access dashboard
- [ ] Verify operators cannot see others' exact scores (only rankings)
- [ ] Verify no XSS in message content rendering (driver messages are user input)
- [ ] Verify no SQL injection vectors
- [ ] Verify service role key is never exposed to the client

### 10.5 — Performance
- [ ] Dashboard loads in < 2 seconds
- [ ] Ticket list with 100+ tickets remains responsive
- [ ] Leaderboard query performs well with 12 operators and 1000+ score entries
- [ ] Realtime subscriptions do not cause memory leaks on long sessions

### 10.6 — Seed Data for Demo
- [ ] Ensure realistic demo data exists: tickets across 15+ days, multiple operators, varied statuses, score entries, driver notes
- [ ] Charts should look populated and meaningful, not sparse

---

## Phase Summary

| Phase | Name | Dependencies | Estimated Scope |
|-------|------|-------------|-----------------|
| 0 | Reset & Cleanup | None | Cleanup, new Supabase project |
| 1 | Database Foundation | Phase 0 | 17 migrations, views, RLS, seed data |
| 2 | Auth & App Shell | Phase 1 | 4 pages, middleware, layout, role guards |
| 3 | Tickets (Core) | Phase 2 | Ticket list, detail view, claiming, resolution, SLA |
| 4 | Drivers | Phase 2 | Drivers list, detail view, notes |
| 5 | Telegram Bot | Phase 1 | Classification pipeline, two-way messaging, media |
| 6 | Scoring & Gamification | Phase 3 | Score categories, resolution flow, leaderboard |
| 7 | Dashboard Overview | Phase 3, 6 | Admin + operator dashboards, KPIs, charts |
| 8 | Performance Tracking | Phase 3 | Performance metrics, views, trend charts |
| 9 | Settings & Admin | Phase 2 | General, teams, users, telegram settings |
| 10 | Polish & Testing | All | Visual review, E2E tests, security audit |

### Parallelization Notes

The following can run **in parallel** without conflict:
- **Phase 3 (Tickets)** and **Phase 4 (Drivers)** — different pages, no shared state
- **Phase 3 (Tickets)** and **Phase 5 (Telegram Bot)** — bot writes to DB, tickets reads from it
- **Phase 6 (Scoring)** and **Phase 9 (Settings)** — different pages
- **Phase 7 (Dashboard)** and **Phase 8 (Performance)** — different views, same data

Strict sequential dependencies:
- Phase 1 **must complete** before anything else starts
- Phase 2 **must complete** before any dashboard page is built
- Phase 3 **must complete** before Phase 6 (scoring depends on ticket resolution)
- Phase 6 **must complete** before Phase 7 (dashboard shows leaderboard/scores)
