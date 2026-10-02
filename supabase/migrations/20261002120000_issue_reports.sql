create table if not exists issue_reports (
  id text primary key,
  created_at timestamptz not null default now(),
  user_id text references users (id) on delete set null,
  note text not null default '',
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  context jsonb not null
);

create index if not exists issue_reports_created_at_idx on issue_reports (created_at desc);
