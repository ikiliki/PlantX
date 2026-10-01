create table if not exists catalog_suggestions (
  id text primary key,
  created_at timestamptz not null default now(),
  status text not null default 'open',
  name text not null,
  scientific_name text not null default '',
  genus text not null default '',
  common_names jsonb not null default '[]'::jsonb,
  provider text not null default '',
  hits integer not null default 1
);

alter table plants drop constraint if exists plants_quality_check;
alter table plants alter column quality drop not null;
alter table plants add constraint plants_quality_check check (quality is null or quality in ('A', 'B', 'C'));
