-- Greenhouse shelves: a grower's own named groups (Balcony, Living room…). A plant sits on at most one shelf.
-- Placement belongs to the greenhouse, not the plant: when a plant changes owner its placement is dropped.

create table shelves (
  id text primary key,
  owner_id text not null references users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 40),
  position integer not null,
  created_at text not null
);

create index shelves_owner_idx on shelves (owner_id, position);

create table shelf_plants (
  plant_id text primary key references plants (id) on delete cascade,
  shelf_id text not null references shelves (id) on delete cascade,
  position integer not null,
  placed_at text not null
);

create index shelf_plants_shelf_idx on shelf_plants (shelf_id, position);
