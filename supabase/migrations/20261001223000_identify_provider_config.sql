-- Per-provider Add Plant response: ready (live) or mock, plus the mock answer.

alter table identify_provider_settings
  add column if not exists config jsonb not null default '{}'::jsonb;
