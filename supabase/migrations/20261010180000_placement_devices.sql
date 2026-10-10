-- A page or component flag can be on for phones, desktops, or both (Admin → System).
alter table system_pages
  add column phone boolean not null default true,
  add column desktop boolean not null default true;

alter table system_placements
  add column phone boolean not null default true,
  add column desktop boolean not null default true;

-- The daily Home starts on phones only; desktop keeps the columns with the feed.
insert into system_placements (placement_id, enabled, phone, desktop)
values ('home.today', true, true, false)
on conflict (placement_id) do update set phone = true, desktop = false;
