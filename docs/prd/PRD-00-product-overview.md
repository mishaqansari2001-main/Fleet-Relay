# PRD-00: Product Overview

## Product Name
**FleetRelay**

## Problem Statement

A trucking logistics company manages **2,000 truck drivers** through Telegram. Drivers contact support via **Telegram Business Account DMs** (3-4 accounts) and **group chats** (up to 8 groups). A team of **12 operators** (4 teams of 3) works in shifts to handle inquiries 24/7.

**Current pain points:**

1. **Missed messages** — High message volume across multiple Telegram channels causes support requests to fall through the cracks. There is no centralized queue or tracking.
2. **No ticket tracking** — There is no formal system to track the status, ownership, or resolution of support requests. Everything happens informally inside Telegram threads.
3. **No performance visibility** — The business owner has no way to know how productive each operator is, how long tickets take to resolve, or whether operators are working their full shifts.
4. **Operator overload complaints** — Staff report being overworked. Without data, the owner cannot verify if the workload is genuinely too high or if there are efficiency issues.
5. **No shift handoff context** — When a new shift starts, incoming operators have no visibility into what the previous shift was handling. Urgent or ongoing cases get dropped.

## Product Vision

FleetRelay is a **unified support dashboard** that:

1. **Automatically creates tickets** from Telegram messages using AI classification, so no inquiry is ever missed.
2. **Provides a single workspace** where operators manage all tickets, reply to drivers (with replies going back to Telegram), and close cases — without ever leaving the dashboard.
3. **Tracks operator performance** through time metrics (ticket pickup time, handling time, daily work hours) so the business owner has full visibility.
4. **Gamifies the workflow** with a scoring system tied to task categories, individual leaderboards, and team competition — where scores directly determine operator pay.

## Target Users

### 1. Admin (Business Owner)
- **Count**: 1 (system supports multiple admins with equal rights)
- **Goals**: Full visibility into all tickets, operator performance, team competition. Manage teams, operators, scoring rules, and system settings.
- **Sees**: Everything — all tickets, all operators, all scores, all analytics.

### 2. Operators
- **Count**: 12 (4 teams of 3, working in shifts)
- **Goals**: Efficiently resolve tickets from a single dashboard. See their own performance stats and leaderboard ranking.
- **Sees**: Open ticket queue, their claimed/assigned tickets, their own score, leaderboard rankings (without others' exact scores).

### 3. Drivers (Passive)
- **Count**: ~2,000
- **Goals**: Get support by messaging on Telegram as they always have. Zero friction, zero new apps.
- **Sees**: Nothing new. They continue using Telegram. The system is invisible to them.

## Core Features

| # | Feature | Description |
|---|---------|-------------|
| F1 | Automatic Ticketing | Telegram messages (DMs + groups) are classified by AI and converted into trackable tickets automatically. |
| F2 | Ticket Management | Operators claim, work on, and resolve tickets from a centralized dashboard. |
| F3 | Two-Way Messaging | Operator replies in the dashboard are sent back to the driver on Telegram. New driver replies are mirrored into the dashboard. |
| F4 | Score Categories | When resolving a ticket, operators select a predefined task category (e.g., "Break", "Break + shift change") that determines point value. |
| F5 | Gamification & Leaderboard | Individual operator scores tracked daily, reset monthly. Team scores = sum of individual scores. Visual leaderboard with rankings. |
| F6 | Performance Tracking | Metrics: ticket pickup time, handling time, estimated daily work hours. Visibility/reporting only — no automated enforcement. |
| F7 | Dashboard & Analytics | KPIs and charts: ticket volume, resolution rates, average times, team comparisons. Admin sees all; operators see their own. |
| F8 | Driver Profiles | Auto-created on first contact. Operators can attach persistent notes to drivers for cross-shift context. |
| F9 | SLA & Urgency | Configurable time limit (default 30 min). Unclaimed tickets past threshold are visually escalated as urgent. |
| F10 | Team Management | Admin creates/edits teams, assigns operators to teams. |

## Non-Goals (Out of Scope)

- **Multi-tenancy** — Single company only. No support for multiple organizations.
- **Mobile app** — Web only.
- **AI auto-responses** — AI classifies and enriches tickets. Operators handle all responses.
- **Driver-facing bot commands** — No /help, /status, or any driver-visible bot behavior.
- **Voice message transcription** — Voice messages stored and playable, not transcribed.
- **Browser/email/Telegram notifications** — No notification system in initial build.
- **CRM integration** — No Bitrix24 or other CRM connectivity.
- **Payment processing** — Scoring determines pay, but actual payment is handled outside the system.
- **Driver satisfaction surveys** — Not in scope.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS 4 |
| Components | shadcn/ui |
| Icons | Phosphor Icons (exclusively) |
| Fonts | Geist Sans + Geist Mono |
| Backend / DB | Supabase (Postgres, Auth, Realtime, Storage) |
| Telegram Bot | Python (FastAPI) |
| AI Classification | GPT-4o-mini (text + vision) |
| Hosting | Render (frontend + bot) |
| Realtime | Supabase Realtime (postgres_changes) |

## Languages Supported

Driver-facing AI outputs (summaries, descriptions, classifications) support:
- **Russian**
- **Arabic**
- **Uzbek**
- **English**

Dashboard UI is in **English**.

## Success Metrics

| Metric | Target |
|--------|--------|
| Missed messages | 0% (every support message becomes a ticket) |
| Average ticket pickup time | Visible and trending down over time |
| Operator utilization visibility | Admin can see estimated daily work hours per operator |
| Score accuracy | Operators consistently categorize tickets with correct score categories |
| Dashboard adoption | Operators work entirely from the dashboard, never from Telegram directly |
