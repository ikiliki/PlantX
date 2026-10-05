-- PlantX-PP only. Run once in the Supabase SQL editor for the PlantX-PP project.
-- One transaction: if any statement fails, nothing is applied.
-- 1) Records the three Oct 4 migrations PP already has (schema checked: no SQL re-run).
-- 2) Applies and records the four new migrations from branch chore/w0-stabilize (PR #65).
-- No data changes: every new column has a default; new tables start empty.

begin;

insert into supabase_migrations.schema_migrations (version, name) values
  ('20261004090000', 'plant_identification_fields'),
  ('20261004091000', 'drop_plant_care_dates'),
  ('20261004120000', 'catalog_suggestion_people')
on conflict do nothing;

-- ===== 20261006100000_rate_limits =====
-- Abuse limits (#57): one counter per key and fixed window. Vercel functions share no memory, so the
-- counter lives here. The key names the route and the caller, e.g. 'identify:user:u-1' or 'session:ip:1.2.3.4'.
create table rate_limits (
  key text not null,
  window_start timestamptz not null,
  count integer not null default 0 check (count >= 0),
  primary key (key, window_start)
);

-- Old windows are pruned by the server; this keeps that delete cheap.
create index rate_limits_window_idx on rate_limits (window_start);

alter table rate_limits enable row level security;
insert into supabase_migrations.schema_migrations (version, name) values ('20261006100000', 'rate_limits') on conflict do nothing;

-- ===== 20261006101000_scan_quota =====
-- AI scan quota (#67). Members get a daily number of Add Plant scans (default 3, reset 00:00 Asia/Jerusalem).
-- Usage is counted from identify_requests; no separate counter.

-- Per-user daily limit set by an admin. Null = the default.
alter table users add column daily_scan_limit integer check (daily_scan_limit is null or daily_scan_limit >= 0);

-- Every admin change: extra scans for one day ('extra', delta may be negative) or a new daily limit ('limit').
create table scan_adjustments (
  id text primary key,
  user_id text not null references users (id) on delete cascade,
  day date not null,
  kind text not null check (kind in ('extra', 'limit')),
  delta integer not null default 0,
  value integer check (value is null or value >= 0),
  reason text not null default '',
  created_by text references users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index scan_adjustments_user_day_idx on scan_adjustments (user_id, day);

-- "Scans today" for one member: Add Plant requests by user since midnight.
create index identify_requests_user_created_idx on identify_requests (user_id, created_at desc);

alter table scan_adjustments enable row level security;
insert into supabase_migrations.schema_migrations (version, name) values ('20261006101000', 'scan_quota') on conflict do nothing;

-- ===== 20261006102000_visibility =====
-- Hide / show / soft delete (#68). Rows are never removed: 'deleted' is reversible by an admin.
-- Children are not rewritten when a parent is hidden; the server computes the cascade (#69),
-- so restoring a parent brings back exactly what was there.

alter table users
  add column visibility text not null default 'visible' check (visibility in ('visible', 'hidden', 'deleted')),
  add column visibility_changed_by text,
  add column visibility_changed_at timestamptz,
  add column visibility_reason text not null default '';

alter table plants
  add column visibility text not null default 'visible' check (visibility in ('visible', 'hidden', 'deleted')),
  add column visibility_changed_by text,
  add column visibility_changed_at timestamptz,
  add column visibility_reason text not null default '';

alter table activities
  add column visibility text not null default 'visible' check (visibility in ('visible', 'hidden', 'deleted')),
  add column visibility_changed_by text,
  add column visibility_changed_at timestamptz,
  add column visibility_reason text not null default '';

create index users_visibility_idx on users (visibility) where visibility <> 'visible';
create index plants_visibility_idx on plants (visibility) where visibility <> 'visible';
create index activities_visibility_idx on activities (visibility) where visibility <> 'visible';
insert into supabase_migrations.schema_migrations (version, name) values ('20261006102000', 'visibility') on conflict do nothing;

-- ===== 20261006103000_moderation_log =====
-- Admin moderation audit (#69): every hide / show / delete / restore, with what the cascade reached.
create table moderation_log (
  id text primary key,
  actor_id text references users (id) on delete set null,
  target_type text not null check (target_type in ('user', 'plant', 'activity')),
  target_id text not null,
  action text not null check (action in ('hide', 'show', 'delete', 'restore', 'edit')),
  reason text not null default '',
  -- e.g. {"plants": 12, "activities": 48, "todos": 9}
  cascade jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index moderation_log_target_idx on moderation_log (target_type, target_id, created_at desc);
create index moderation_log_created_idx on moderation_log (created_at desc);

alter table moderation_log enable row level security;
insert into supabase_migrations.schema_migrations (version, name) values ('20261006103000', 'moderation_log') on conflict do nothing;

commit;

-- Check: expect 4 rows (rate_limits, scan_adjustments, moderation_log, users.visibility).
select 'rate_limits' as item, to_regclass('public.rate_limits') is not null as ok
union all select 'scan_adjustments', to_regclass('public.scan_adjustments') is not null
union all select 'moderation_log', to_regclass('public.moderation_log') is not null
union all select 'users.visibility', exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'visibility');
