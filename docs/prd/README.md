# FleetRelay — Product Requirements Documents

## Documents

| # | Document | Description |
|---|----------|-------------|
| 00 | [Product Overview](./PRD-00-product-overview.md) | Vision, goals, user personas, feature list, tech stack, constraints |
| 01 | [Auth, Roles & Teams](./PRD-01-auth-roles-teams.md) | Authentication flow, signup/approval, role permissions, team management |
| 02 | [Telegram Bot & Integration](./PRD-02-telegram-bot.md) | Bot architecture, message classification pipeline, two-way messaging, media handling, AI enrichment |
| 03 | [Ticketing System](./PRD-03-ticketing-system.md) | Ticket lifecycle, statuses, SLA/urgency, claiming, conversation thread, resolution with score categories |
| 04 | [Scoring & Gamification](./PRD-04-scoring-gamification.md) | Score categories, point system, leaderboards, team competition, visibility rules |
| 05 | [Performance Tracking](./PRD-05-performance-tracking.md) | Pickup time, handling time, daily work hours, reporting |
| 06 | [Dashboard & Analytics](./PRD-06-dashboard-analytics.md) | Dashboard layout, KPIs, charts, admin vs operator views, settings pages, realtime |
| 07 | [Drivers](./PRD-07-drivers.md) | Driver profiles, driver notes, drivers page, driver context in ticket view |
| 08 | [Database Schema](./PRD-08-database-schema.md) | Full Supabase Postgres schema, tables, views, functions, RLS policies, storage |

## Key Decisions

| Decision | Choice |
|----------|--------|
| Deployment | Single-tenant (one company) |
| Fleet size | ~2,000 truck drivers |
| Team structure | 4 teams of 3 operators, admin-managed |
| Telegram channels | 3-4 Business Account DMs + up to 8 groups |
| Bot architecture | Single bot, single token |
| Ticket creation | Automatic via AI classification (two-layer pipeline) |
| Ticket claiming | Manual (operator picks from queue) |
| Ticket transfer | Not supported (release + re-claim) |
| Two-way messaging | Dashboard replies sent back to Telegram |
| Scoring | One score category per resolved ticket, predefined point values |
| Leaderboard | Monthly cycle, daily tracking |
| Performance tracking | Visibility/reporting only, no enforcement |
| Urgency escalation | Unclaimed > 30 min (configurable), visual flag only |
| Auth | Supabase email verification, admin approval for new accounts |
| Notifications | Not in initial build |
| Voice transcription | Not in initial build |
| Mobile | Web only |
| Hosting | Render |
