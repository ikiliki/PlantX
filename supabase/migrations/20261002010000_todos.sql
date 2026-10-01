-- Care todos own water and photo schedules. Plant dates move here.

create table todos (
  id text primary key,
  position integer not null,
  owner_id text not null references users (id) on delete cascade,
  plant_id text not null references plants (id) on delete cascade,
  category text not null check (category in ('plant')),
  subcategory text not null check (subcategory in ('water', 'photo')),
  due_on text,
  completed_on text,
  created_at text not null
);

create index todos_owner_id_idx on todos (owner_id);
create index todos_plant_id_idx on todos (plant_id);
create unique index todos_open_unique
  on todos (plant_id, category, subcategory)
  where completed_on is null;

alter table todos enable row level security;
