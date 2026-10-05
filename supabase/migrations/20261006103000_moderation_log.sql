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
