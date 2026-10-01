-- Links Add Plant identify requests to the plant they became, per photo.

-- One AI check per saved plant photo (the sticker on each photo).
create table plant_photo_checks (
  plant_id text not null references plants (id) on delete cascade,
  position integer not null check (position >= 0),
  result text not null check (result in ('match', 'mismatch', 'notPlant', 'failed', 'unscanned')),
  request_id text references identify_requests (id) on delete set null,
  provider text check (provider is null or provider in ('plantid', 'plantnet', 'gemini')),
  mode text check (mode is null or mode in ('mock', 'live')),
  label text,
  probability double precision check (probability is null or (probability >= 0 and probability <= 1)),
  primary key (plant_id, position)
);

alter table plant_photo_checks enable row level security;

-- A request with no plant_id was never added.
alter table identify_requests
  add column plant_id text references plants (id) on delete set null,
  add column photo_index integer check (photo_index is null or photo_index >= 0),
  add column fields jsonb;

create index identify_requests_plant_id_idx on identify_requests (plant_id);

-- `scan`: an Add Plant identify call. `added`: a plant joined the greenhouse.
alter table activities drop constraint activities_kind_check;
alter table activities
  add constraint activities_kind_check
  check (kind in ('photo', 'water', 'propagate', 'grade', 'passport', 'listing', 'scan', 'added'));

alter table activities
  add column identify_request_id text references identify_requests (id) on delete set null;

create index activities_identify_request_id_idx on activities (identify_request_id);
