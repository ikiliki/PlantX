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
