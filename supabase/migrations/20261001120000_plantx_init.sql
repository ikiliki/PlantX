-- PlantX normalized schema.
-- The API speaks domain objects through PlantxStore. This driver stores them as rows.
-- Local QA: npm run qa:up. Hosted later: same migration, another DATABASE_URL.

-- People -----------------------------------------------------------------

create table users (
  id text primary key,
  position integer not null,
  name text not null,
  name_he text not null,
  role text not null check (role in ('grower', 'collector', 'business', 'nursery', 'admin', 'guest')),
  business_name text,
  business_name_he text,
  region text not null default '',
  region_he text not null default '',
  lat double precision,
  lng double precision,
  bio text not null default '',
  bio_he text not null default '',
  rating numeric not null default 0,
  completed_orders integer not null default 0,
  verification_rate numeric not null default 0,
  cancellations integer not null default 0,
  avatar_color text not null,
  email text,
  account_status text not null default 'active' check (account_status in ('active', 'disabled')),
  constraint users_email_unique unique (email)
);

create table user_specialties (
  user_id text not null references users (id) on delete cascade,
  locale text not null check (locale in ('en', 'he')),
  position integer not null,
  label text not null,
  primary key (user_id, locale, position)
);

create table user_friends (
  user_id text not null references users (id) on delete cascade,
  position integer not null,
  friend_id text not null references users (id) on delete cascade,
  primary key (user_id, position),
  unique (user_id, friend_id),
  check (user_id <> friend_id)
);

-- Access queue -----------------------------------------------------------

create table pending_users (
  id text primary key,
  position integer not null,
  name text not null,
  email text not null,
  note text,
  created_at text not null,
  status text not null check (status in ('pending', 'approved', 'rejected')),
  approved_at text,
  rejected_at text,
  user_id text references users (id) on delete set null
);

create table pending_transactions (
  id text primary key,
  position integer not null,
  kind text not null check (kind in ('purchase', 'listing', 'transfer')),
  user_id text not null references users (id) on delete cascade,
  label text not null,
  label_he text not null,
  amount numeric,
  created_at text not null,
  status text not null check (status in ('pending', 'released', 'cancelled'))
);

-- Catalog ----------------------------------------------------------------

create table catalog_categories (
  id text primary key,
  position integer not null,
  species_id text not null,
  name text not null,
  name_he text not null,
  ticker text not null,
  photo text not null default ''
);

create table catalog_subcategories (
  id text primary key,
  position integer not null,
  category_id text not null references catalog_categories (id) on delete restrict,
  name text not null,
  name_he text not null,
  code text not null,
  photo text
);

create table catalog_properties (
  id text primary key,
  position integer not null,
  name text not null,
  name_he text not null,
  required boolean not null default false,
  in_market_name boolean not null default false,
  sign text not null default ''
);

create table catalog_property_options (
  property_id text not null references catalog_properties (id) on delete cascade,
  id text not null,
  position integer not null,
  label text not null,
  label_he text not null,
  sign text not null default '',
  primary key (property_id, id)
);

create table catalog_property_categories (
  property_id text not null references catalog_properties (id) on delete cascade,
  category_id text not null references catalog_categories (id) on delete cascade,
  primary key (property_id, category_id)
);

create table catalog_property_subcategories (
  property_id text not null references catalog_properties (id) on delete cascade,
  subcategory_id text not null references catalog_subcategories (id) on delete cascade,
  primary key (property_id, subcategory_id)
);

-- Greenhouse --------------------------------------------------------------

create table plants (
  id text primary key,
  position integer not null,
  code text not null,
  owner_id text not null references users (id) on delete cascade,
  species_id text not null,
  market_class_id text,
  variety text,
  variety_he text,
  subcategory_id text references catalog_subcategories (id) on delete restrict,
  title text not null,
  title_he text not null,
  description text,
  description_he text,
  quantity integer not null,
  size_grade text not null,
  size_band text check (size_band is null or size_band in ('S', 'M', 'L', 'XL')),
  quality text not null check (quality in ('A', 'B', 'C')),
  rooting text not null check (rooting in ('rooted', 'unrooted', 'established')),
  stage text check (stage is null or stage in ('CUT', 'ROOTED', 'EST', 'MATURE')),
  pot_format text,
  pot_format_he text,
  pot_size_cm integer,
  stem_length_cm integer,
  leaf_count integer,
  location_zone text not null,
  location_zone_he text not null,
  lat double precision not null,
  lng double precision not null,
  parent_id text references plants (id) on delete set null,
  batch_id text,
  propagated_at text,
  verified_at text,
  verified_by text,
  photo_at text,
  watered_at text,
  status text not null check (status in ('owned', 'listed', 'sold')),
  published_at text,
  rarity text check (rarity is null or rarity in ('common', 'rare', 'unique')),
  growth_time_en text,
  growth_time_he text,
  growth_light text,
  growth_light_he text,
  growth_water text,
  growth_water_he text,
  growth_note text,
  growth_note_he text,
  created_at text not null
);

create index plants_owner_id_idx on plants (owner_id);

create table plant_photos (
  plant_id text not null references plants (id) on delete cascade,
  position integer not null,
  url text not null,
  primary key (plant_id, position)
);

create table plant_traits (
  plant_id text not null references plants (id) on delete cascade,
  position integer not null,
  trait_key text not null,
  trait_value text not null,
  primary key (plant_id, trait_key)
);

create table plant_history (
  plant_id text not null references plants (id) on delete cascade,
  position integer not null,
  at text not null,
  label text not null,
  label_he text not null,
  primary key (plant_id, position)
);

create table plant_comps (
  plant_id text not null references plants (id) on delete cascade,
  position integer not null,
  price numeric not null,
  on_date text not null,
  note text not null,
  note_he text not null,
  primary key (plant_id, position)
);

create table plant_grades (
  plant_id text not null references plants (id) on delete cascade,
  position integer not null,
  grader_id text not null,
  letter text not null check (letter in ('S', 'A', 'B', 'C')),
  at text not null,
  primary key (plant_id, position),
  unique (plant_id, grader_id)
);

-- Activity log ------------------------------------------------------------

create table activities (
  id text primary key,
  position integer not null,
  kind text not null check (kind in ('photo', 'water', 'propagate', 'grade', 'passport', 'listing')),
  user_id text not null references users (id) on delete cascade,
  plant_id text references plants (id) on delete cascade,
  body text not null,
  body_he text not null,
  created_at text not null
);

create index activities_user_id_idx on activities (user_id);
create index activities_plant_id_idx on activities (plant_id);

-- Release config ----------------------------------------------------------

create table system_config (
  id text primary key,
  launched boolean not null
);

create table system_pages (
  page_id text primary key,
  status text not null check (status in ('live', 'maintenance'))
);

create table system_features (
  feature_id text primary key,
  enabled boolean not null,
  status text not null check (status in ('ready', 'comingSoon', 'maintenance'))
);

create table system_placements (
  placement_id text primary key,
  enabled boolean not null
);

-- Direct SQL (the API, Studio) can read these. The public Data API cannot.
alter table users enable row level security;
alter table user_specialties enable row level security;
alter table user_friends enable row level security;
alter table pending_users enable row level security;
alter table pending_transactions enable row level security;
alter table catalog_categories enable row level security;
alter table catalog_subcategories enable row level security;
alter table catalog_properties enable row level security;
alter table catalog_property_options enable row level security;
alter table catalog_property_categories enable row level security;
alter table catalog_property_subcategories enable row level security;
alter table plants enable row level security;
alter table plant_photos enable row level security;
alter table plant_traits enable row level security;
alter table plant_history enable row level security;
alter table plant_comps enable row level security;
alter table plant_grades enable row level security;
alter table activities enable row level security;
alter table system_config enable row level security;
alter table system_pages enable row level security;
alter table system_features enable row level security;
alter table system_placements enable row level security;
