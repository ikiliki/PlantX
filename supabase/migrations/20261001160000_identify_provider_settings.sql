-- Admin on/off switch per identify provider. No row means enabled.

create table identify_provider_settings (
  provider_id text primary key check (provider_id in ('plantid', 'plantnet', 'gemini')),
  enabled boolean not null,
  updated_at text not null
);

alter table identify_provider_settings enable row level security;
