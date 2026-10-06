-- Legal consent (MVP): which version of the Terms and Privacy Policy a member agreed to, and when.
-- A sign-up agrees on the login page; approval copies the pending row's consent onto the new user.
-- An older version (or none) makes the app ask once before anything else.
alter table users
  add column terms_version text,
  add column terms_accepted_at text;

alter table pending_users
  add column terms_version text,
  add column terms_accepted_at text;

-- Funnel analytics (#59). First-party only: no third-party tracker, no device id, no PII in props.
-- Signed-in events carry the user so "first" and distinct counts work; deleting the account deletes them.
create table analytics_events (
  id bigint generated always as identity primary key,
  name text not null check (name in (
    'landing_view', 'guest_start', 'signup_start', 'signup_done', 'plant_add_start',
    'identify_result', 'plant_saved', 'care_done', 'session_return'
  )),
  user_id text references users (id) on delete cascade,
  props jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index analytics_events_created_idx on analytics_events (created_at);
create index analytics_events_name_created_idx on analytics_events (name, created_at);
create index analytics_events_user_idx on analytics_events (user_id, name, created_at);

alter table analytics_events enable row level security;
