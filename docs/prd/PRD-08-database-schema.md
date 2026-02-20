# PRD-08: Database Schema

## Overview

Complete Supabase Postgres schema for FleetRelay. Designed for a single-tenant deployment (one company). All tables use UUID primary keys and timestamptz for timestamps. Row Level Security (RLS) is enabled on all tables.

---

## Entity Relationship Summary

```
teams
  |-- 1:N -- users (operators/admins belong to a team)

users
  |-- 1:N -- tickets (assigned_operator)
  |-- 1:N -- ticket_messages (sender)
  |-- 1:N -- score_entries (operator who earned points)
  |-- 1:N -- driver_notes (author)

drivers
  |-- 1:N -- tickets
  |-- 1:N -- driver_notes

tickets
  |-- 1:N -- ticket_messages
  |-- 1:1 -- score_entries (one score entry per resolved ticket)

score_categories
  |-- 1:N -- score_entries
  |-- 1:N -- tickets (score_category_id on resolution)

telegram_connections
  (stores connected business accounts and groups)

raw_messages
  (audit trail — all non-skip messages from Telegram)

settings
  (key-value store for system configuration)
```

---

## Tables

### `teams`

```sql
CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### `users`

Extends Supabase `auth.users`. Created via a trigger on `auth.users` insert.

```sql
CREATE TYPE user_role AS ENUM ('admin', 'operator');
CREATE TYPE user_status AS ENUM ('pending_approval', 'active', 'rejected', 'deactivated');

CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'operator',
  status user_status NOT NULL DEFAULT 'pending_approval',
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**Trigger:** On `auth.users` insert, automatically create a row in `users` with data from auth metadata (full_name, role from signup form).

**Bootstrap rule:** The first user to sign up is auto-approved as admin.

### `drivers`

```sql
CREATE TABLE drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id bigint NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text,
  username text,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_drivers_telegram_user_id ON drivers(telegram_user_id);
```

### `driver_notes`

```sql
CREATE TABLE driver_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_driver_notes_driver_id ON driver_notes(driver_id);
```

### `score_categories`

```sql
CREATE TABLE score_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  points integer NOT NULL CHECK (points > 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### `tickets`

```sql
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'dismissed');
CREATE TYPE ticket_priority AS ENUM ('normal', 'urgent');
CREATE TYPE ticket_source AS ENUM ('business_dm', 'group');

CREATE TABLE tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_id text NOT NULL UNIQUE,
  driver_id uuid NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  source_type ticket_source NOT NULL,
  source_chat_id bigint NOT NULL,
  source_name text, -- human-readable source label (group name or "DM: Account X")
  business_connection_id text, -- null for group tickets
  status ticket_status NOT NULL DEFAULT 'open',
  priority ticket_priority NOT NULL DEFAULT 'normal',
  is_urgent boolean NOT NULL DEFAULT false,
  assigned_operator_id uuid REFERENCES users(id) ON DELETE SET NULL,
  score_category_id uuid REFERENCES score_categories(id) ON DELETE SET NULL,
  ai_summary text,
  ai_category text,
  ai_urgency integer CHECK (ai_urgency BETWEEN 1 AND 5),
  ai_location text,
  claimed_at timestamptz,
  resolved_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_driver_id ON tickets(driver_id);
CREATE INDEX idx_tickets_assigned_operator_id ON tickets(assigned_operator_id);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_tickets_source_chat_id ON tickets(source_chat_id);
```

**`display_id` generation:** A database function generates sequential IDs in the format `TKT-0001`, `TKT-0002`, etc.

```sql
CREATE SEQUENCE ticket_display_id_seq START 1;

CREATE OR REPLACE FUNCTION next_ticket_display_id()
RETURNS text AS $$
BEGIN
  RETURN 'TKT-' || LPAD(nextval('ticket_display_id_seq')::text, 4, '0');
END;
$$ LANGUAGE plpgsql;
```

Set as default: `display_id text NOT NULL DEFAULT next_ticket_display_id()`

### `ticket_messages`

```sql
CREATE TYPE message_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE message_sender_type AS ENUM ('driver', 'operator', 'system');
CREATE TYPE message_content_type AS ENUM ('text', 'photo', 'voice', 'video', 'document', 'location');
CREATE TYPE message_delivery_status AS ENUM ('pending', 'sent', 'delivered', 'failed');

CREATE TABLE ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  direction message_direction NOT NULL,
  sender_type message_sender_type NOT NULL,
  sender_name text NOT NULL,
  sender_user_id uuid REFERENCES users(id) ON DELETE SET NULL, -- for operator messages
  telegram_message_id bigint, -- for reply targeting
  content_text text,
  content_type message_content_type NOT NULL DEFAULT 'text',
  media_url text,
  media_thumbnail_url text,
  ai_media_description text,
  is_internal_note boolean NOT NULL DEFAULT false,
  delivery_status message_delivery_status, -- for outbound messages only
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX idx_ticket_messages_telegram_message_id ON ticket_messages(telegram_message_id);
```

### `score_entries`

```sql
CREATE TABLE score_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL UNIQUE REFERENCES tickets(id) ON DELETE CASCADE,
  operator_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score_category_id uuid NOT NULL REFERENCES score_categories(id) ON DELETE RESTRICT,
  points integer NOT NULL, -- snapshot of points at time of resolution
  scored_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_score_entries_operator_id ON score_entries(operator_id);
CREATE INDEX idx_score_entries_scored_date ON score_entries(scored_date);
CREATE INDEX idx_score_entries_operator_date ON score_entries(operator_id, scored_date);
```

### `telegram_connections`

```sql
CREATE TYPE telegram_connection_type AS ENUM ('business_account', 'group');

CREATE TABLE telegram_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_type telegram_connection_type NOT NULL,
  chat_id bigint, -- for groups
  business_connection_id text, -- for business accounts
  display_name text NOT NULL, -- human-readable label
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### `raw_messages`

```sql
CREATE TABLE raw_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_message_id bigint NOT NULL,
  telegram_user_id bigint NOT NULL,
  chat_id bigint NOT NULL,
  chat_type text NOT NULL, -- 'private', 'group', 'supergroup'
  content_text text,
  content_type text NOT NULL,
  has_media boolean NOT NULL DEFAULT false,
  classification_result text, -- 'ticket', 'appended', 'dismissed', 'buffered'
  classification_source text, -- 'rule_skip', 'rule_noise', 'rule_explicit', 'rule_append', 'ai_text', 'ai_vision', 'auto_media', 'buffer_timeout'
  ai_raw_response jsonb,
  ticket_id uuid REFERENCES tickets(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_raw_messages_telegram_user_id ON raw_messages(telegram_user_id);
CREATE INDEX idx_raw_messages_chat_id ON raw_messages(chat_id);
CREATE INDEX idx_raw_messages_created_at ON raw_messages(created_at);
```

### `settings`

Key-value store for system-wide configuration.

```sql
CREATE TABLE settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

Default entries:

```sql
INSERT INTO settings (key, value) VALUES
  ('sla_urgency_threshold_minutes', '30'),
  ('company_name', '"FleetRelay"');
```

---

## Database Functions

### `handle_updated_at()`

Automatically updates `updated_at` on row modification.

```sql
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Applied as a trigger on: `teams`, `users`, `drivers`, `tickets`, `score_categories`, `telegram_connections`, `settings`.

### `handle_new_user()`

Trigger on `auth.users` insert. Creates a corresponding `users` row.

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count integer;
  initial_status user_status;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users;

  -- First user is auto-approved as admin
  IF user_count = 0 THEN
    initial_status := 'active';
  ELSE
    initial_status := 'pending_approval';
  END IF;

  INSERT INTO users (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'operator'),
    initial_status
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### `check_ticket_urgency()`

Periodic check (or triggered on ticket access) to flag unclaimed tickets past the SLA threshold.

```sql
CREATE OR REPLACE FUNCTION check_ticket_urgency()
RETURNS void AS $$
DECLARE
  threshold_minutes integer;
BEGIN
  SELECT (value::text)::integer INTO threshold_minutes
  FROM settings WHERE key = 'sla_urgency_threshold_minutes';

  UPDATE tickets
  SET is_urgent = true, priority = 'urgent', updated_at = now()
  WHERE status = 'open'
    AND is_urgent = false
    AND created_at < now() - (threshold_minutes || ' minutes')::interval;
END;
$$ LANGUAGE plpgsql;
```

This can be called periodically via a Supabase cron job (pg_cron) or checked on dashboard load.

---

## Database Views

### `operator_daily_stats`

```sql
CREATE VIEW operator_daily_stats AS
SELECT
  u.id AS operator_id,
  u.full_name AS operator_name,
  u.team_id,
  d.date,
  COALESCE(d.tickets_resolved, 0) AS tickets_resolved,
  COALESCE(d.tickets_dismissed, 0) AS tickets_dismissed,
  d.avg_pickup_time_minutes,
  d.avg_handling_time_minutes,
  d.total_handling_time_minutes,
  COALESCE(s.total_points, 0) AS total_points
FROM users u
CROSS JOIN generate_series(
  (SELECT MIN(created_at)::date FROM tickets),
  CURRENT_DATE,
  '1 day'::interval
) AS d(date)
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) FILTER (WHERE t.status = 'resolved') AS tickets_resolved,
    COUNT(*) FILTER (WHERE t.status = 'dismissed') AS tickets_dismissed,
    AVG(EXTRACT(EPOCH FROM (t.claimed_at - t.created_at)) / 60)
      FILTER (WHERE t.claimed_at IS NOT NULL) AS avg_pickup_time_minutes,
    AVG(EXTRACT(EPOCH FROM (COALESCE(t.resolved_at, t.dismissed_at) - t.claimed_at)) / 60)
      FILTER (WHERE COALESCE(t.resolved_at, t.dismissed_at) IS NOT NULL) AS avg_handling_time_minutes,
    SUM(EXTRACT(EPOCH FROM (COALESCE(t.resolved_at, t.dismissed_at) - t.claimed_at)) / 60)
      FILTER (WHERE COALESCE(t.resolved_at, t.dismissed_at) IS NOT NULL) AS total_handling_time_minutes
  FROM tickets t
  WHERE t.assigned_operator_id = u.id
    AND COALESCE(t.resolved_at, t.dismissed_at)::date = d.date
) d_stats ON true
LEFT JOIN LATERAL (
  SELECT SUM(se.points) AS total_points
  FROM score_entries se
  WHERE se.operator_id = u.id
    AND se.scored_date = d.date
) s ON true
WHERE u.role = 'operator';
```

### `team_monthly_stats`

```sql
CREATE VIEW team_monthly_stats AS
SELECT
  t.id AS team_id,
  t.name AS team_name,
  date_trunc('month', se.scored_date) AS month,
  SUM(se.points) AS total_points,
  COUNT(DISTINCT se.operator_id) AS active_members,
  COUNT(se.id) AS tickets_scored
FROM teams t
JOIN users u ON u.team_id = t.id
JOIN score_entries se ON se.operator_id = u.id
GROUP BY t.id, t.name, date_trunc('month', se.scored_date);
```

### `leaderboard_current_month`

```sql
CREATE VIEW leaderboard_current_month AS
SELECT
  u.id AS operator_id,
  u.full_name,
  u.team_id,
  t.name AS team_name,
  COALESCE(SUM(se.points), 0) AS total_score,
  COUNT(se.id) AS tickets_scored,
  RANK() OVER (ORDER BY COALESCE(SUM(se.points), 0) DESC) AS rank
FROM users u
LEFT JOIN teams t ON t.id = u.team_id
LEFT JOIN score_entries se ON se.operator_id = u.id
  AND se.scored_date >= date_trunc('month', CURRENT_DATE)
  AND se.scored_date < date_trunc('month', CURRENT_DATE) + interval '1 month'
WHERE u.role = 'operator'
  AND u.status = 'active'
GROUP BY u.id, u.full_name, u.team_id, t.name;
```

---

## Row Level Security (RLS)

All tables have RLS enabled. Policies use `(SELECT auth.uid())` for performance.

### `users`
- **SELECT:** Authenticated users can read all users (needed for operator names, team lists, leaderboard).
- **UPDATE:** Users can update their own row (limited fields). Admins can update any user.
- **INSERT:** Only via trigger (handled by `handle_new_user`).

### `tickets`
- **SELECT:** Admins see all. Operators see: all `open` tickets + tickets where `assigned_operator_id` = their ID.
- **UPDATE:** Operators can update tickets assigned to them. Admins can update any ticket.
- **INSERT:** Only via service role (bot creates tickets).

### `ticket_messages`
- **SELECT:** If user can see the parent ticket, they can see its messages.
- **INSERT:** Operators can insert messages on tickets assigned to them. Bot inserts via service role.

### `score_entries`
- **SELECT:** Admins see all. Operators see their own entries.
- **INSERT:** Created when operator resolves a ticket (could be via function or app logic).

### `score_categories`
- **SELECT:** All authenticated users (operators need to see categories when resolving).
- **INSERT/UPDATE:** Admin only.

### `drivers`
- **SELECT:** All authenticated users.
- **UPDATE:** Service role only (bot updates driver info).
- **INSERT:** Service role only (bot creates drivers).

### `driver_notes`
- **SELECT:** All authenticated users.
- **INSERT:** All authenticated users.
- **DELETE:** Author can delete their own notes. Admins can delete any note.

### `settings`
- **SELECT:** All authenticated users (needed for SLA threshold on dashboard).
- **UPDATE:** Admin only.

### `raw_messages`
- **SELECT:** Admin only (audit trail).
- **INSERT:** Service role only (bot inserts).

### `telegram_connections`
- **SELECT:** Admin only.
- **INSERT/UPDATE:** Admin only.

---

## Supabase Realtime

Enable Realtime on these tables for live dashboard updates:

| Table | Events |
|-------|--------|
| `tickets` | INSERT, UPDATE |
| `ticket_messages` | INSERT |
| `score_entries` | INSERT |

---

## Storage Buckets

### `ticket-media`

Stores media files from Telegram messages (photos, videos, voice, documents).

| Setting | Value |
|---------|-------|
| Public | No (authenticated access only) |
| File size limit | 50 MB |
| Allowed types | image/*, video/*, audio/*, application/pdf |

File path convention: `{ticket_id}/{message_id}/{filename}`

---

## Migrations

Schema should be applied via numbered Supabase migrations for version control:

```
001_create_enums.sql
002_create_teams.sql
003_create_users.sql
004_create_drivers.sql
005_create_driver_notes.sql
006_create_score_categories.sql
007_create_tickets.sql
008_create_ticket_messages.sql
009_create_score_entries.sql
010_create_telegram_connections.sql
011_create_raw_messages.sql
012_create_settings.sql
013_create_views.sql
014_create_functions_and_triggers.sql
015_create_rls_policies.sql
016_enable_realtime.sql
017_create_storage_buckets.sql
```
