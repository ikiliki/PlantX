-- Photo identify requests: Add Plant and the admin playground, mock and live.

create table identify_requests (
  id text primary key,
  created_at text not null,
  user_id text not null references users (id) on delete cascade,
  source text not null check (source in ('addPlant', 'playground')),
  mode text not null check (mode in ('mock', 'live')),
  target text not null check (target in ('chain', 'plantid', 'plantnet', 'gemini')),
  scenario text check (scenario in ('match', 'notInCatalog', 'notPlant', 'error')),
  status text not null check (status in ('ok', 'unavailable')),
  thumb text,
  duration_ms integer not null,
  diagnosis jsonb,
  tried jsonb not null default '[]'::jsonb
);

create index identify_requests_created_at_idx on identify_requests (created_at desc);
create index identify_requests_mode_idx on identify_requests (mode);

alter table identify_requests enable row level security;
