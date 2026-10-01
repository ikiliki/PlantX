alter table catalog_suggestions
  add column if not exists draft jsonb not null default '{}'::jsonb;
