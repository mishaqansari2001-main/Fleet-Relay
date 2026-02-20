# PRD-01: Authentication, Roles & Team Management

## Overview

FleetRelay has two user roles: **Admin** and **Operator**. Authentication uses Supabase Auth with email verification. New accounts require admin approval before gaining access.

---

## Authentication Flow

### Signup

1. User navigates to the signup page.
2. User enters: **full name**, **email**, **password**.
3. User selects their role: **Admin** or **Operator**.
4. User submits the form.
5. Supabase sends a **verification email** to the provided address.
6. User clicks the verification link in the email.
7. Account is created with status **`pending_approval`**.
8. User sees a "pending approval" screen — they cannot access the dashboard until an admin approves them.

### Admin Approval

1. Admin sees a list of pending accounts in the **Settings > User Management** section.
2. Each pending account shows: name, email, requested role, signup date.
3. Admin can **approve** or **reject** each account.
4. On approval, the account status changes to **`active`** and the user can log in to the dashboard.
5. On rejection, the account is marked as **`rejected`** (can be deleted or re-reviewed later).

### Login

1. User enters email and password.
2. Supabase Auth validates credentials.
3. System checks account status:
   - **`active`** — Proceed to dashboard.
   - **`pending_approval`** — Show "Your account is pending admin approval" message.
   - **`rejected`** — Show "Your account has been rejected. Contact your administrator."
   - **`deactivated`** — Show "Your account has been deactivated. Contact your administrator."
4. On successful login, redirect to the role-appropriate dashboard view.

### Password Reset

Standard Supabase Auth password reset flow via email.

---

## Roles & Permissions

### Admin

| Capability | Access |
|-----------|--------|
| View all tickets (all statuses, all operators) | Yes |
| Claim and resolve tickets | Yes |
| View all operator scores (exact values) | Yes |
| View leaderboard (all rankings + all scores) | Yes |
| View performance metrics (all operators) | Yes |
| View dashboard analytics (all KPIs, all charts) | Yes |
| Manage teams (create, edit, delete, assign operators) | Yes |
| Manage score categories (create, edit, delete, change point values) | Yes |
| Approve/reject new user signups | Yes |
| Deactivate/reactivate user accounts | Yes |
| Configure system settings (SLA thresholds, urgency timers) | Yes |
| Manage Telegram connections (business accounts, groups) | Yes |
| View driver profiles and notes | Yes |
| Add driver notes | Yes |

### Operator

| Capability | Access |
|-----------|--------|
| View open ticket queue (all unclaimed tickets) | Yes |
| Claim open tickets | Yes |
| View and work on their own claimed tickets | Yes |
| Reply to tickets (sent back to driver on Telegram) | Yes |
| Add internal notes to tickets | Yes |
| Select score category when resolving a ticket | Yes |
| View their own score | Yes |
| View leaderboard rankings (positions of all operators) | Yes |
| View other operators' exact scores | **No** |
| View their own performance stats (pickup time, handling time) | Yes |
| View other operators' performance stats | **No** |
| View driver profiles and notes | Yes |
| Add driver notes | Yes |
| Manage teams, scores, settings, or users | **No** |

---

## Team Management

### Structure

- The system supports **multiple teams**.
- Each team has a **name** and contains **one or more operators**.
- There are no team leads — all operators within a team are equal.
- An operator belongs to **exactly one team** at a time.

### Admin Capabilities

| Action | Description |
|--------|-------------|
| Create team | Admin provides a team name. Team is created empty. |
| Rename team | Admin can change the name of an existing team. |
| Delete team | Admin can delete a team only if it has no operators assigned. Operators must be reassigned first. |
| Assign operator to team | Admin selects an operator and assigns them to a team. If the operator was in another team, they are moved. |
| Remove operator from team | Admin can remove an operator from a team, leaving them unassigned. |

### Initial Setup

The client starts with **4 teams of 3 operators each**. This is configured by the admin after the system is deployed — the system does not enforce a fixed number of teams or team sizes.

---

## User Account Management

### Account Statuses

| Status | Description |
|--------|-------------|
| `pending_approval` | User has signed up and verified email. Awaiting admin approval. |
| `active` | User is approved and can access the dashboard. |
| `rejected` | Admin rejected the signup request. User cannot log in. |
| `deactivated` | Admin deactivated an existing user. User cannot log in. |

### Admin Actions on Accounts

| Action | Description |
|--------|-------------|
| Approve | Change status from `pending_approval` to `active`. |
| Reject | Change status from `pending_approval` to `rejected`. |
| Deactivate | Change status from `active` to `deactivated`. User loses access immediately. |
| Reactivate | Change status from `deactivated` to `active`. User regains access. |
| Change role | Admin can change a user's role between `admin` and `operator`. |

### Security Considerations

- The **first user** to sign up for the system is automatically granted admin role and is auto-approved (bootstrap account).
- Subsequent users require admin approval regardless of the role they select during signup.
- Role selection at signup is a **request** — the admin confirms the role during approval. The admin can override the requested role (e.g., someone requests admin but is approved as operator).
- Session management uses Supabase Auth cookies with middleware-based refresh.

---

## Database Tables (Auth-Related)

### `users` (extends Supabase `auth.users`)

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Matches Supabase auth.users.id |
| email | text | User's email |
| full_name | text | User's full name |
| role | enum: `admin`, `operator` | User's role |
| status | enum: `pending_approval`, `active`, `rejected`, `deactivated` | Account status |
| team_id | uuid (FK, nullable) | Team assignment (null if unassigned) |
| created_at | timestamptz | Signup timestamp |
| updated_at | timestamptz | Last update |

### `teams`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Team identifier |
| name | text | Team name (e.g., "Team Alpha") |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update |

---

## UI Pages

| Page | Description | Access |
|------|-------------|--------|
| `/signup` | Signup form with role selection | Public |
| `/login` | Login form | Public |
| `/pending-approval` | Shown after signup, before admin approval | Authenticated, pending |
| `/dashboard/settings/users` | User management: approve, reject, deactivate, change roles | Admin only |
| `/dashboard/settings/teams` | Team management: create, rename, assign operators | Admin only |
