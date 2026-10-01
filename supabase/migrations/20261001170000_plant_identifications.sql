-- How a plant's class was identified when it was added: by an identify provider, or by hand.

create table plant_identifications (
  plant_id text primary key references plants (id) on delete cascade,
  source text not null check (source in ('ai', 'edited', 'manual')),
  provider text check (provider is null or provider in ('plantid', 'plantnet', 'gemini')),
  mode text check (mode is null or mode in ('mock', 'live')),
  label text,
  scientific_name text,
  probability double precision check (probability is null or (probability >= 0 and probability <= 1)),
  request_id text references identify_requests (id) on delete set null,
  identified_at text not null
);

create index plant_identifications_provider_idx on plant_identifications (provider);

alter table plant_identifications enable row level security;
