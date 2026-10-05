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
