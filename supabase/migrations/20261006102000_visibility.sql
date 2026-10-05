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
