-- Care plans: how often each kind of care repeats, as JSON keyed by kind:
--   {"water": {"everyDays": 7, "winterEveryDays": 12}, "feed": {"everyDays": 30, "months": [3,4,5,6,7,8,9]}, "rotate": null}
-- A category sets it for its plants, a variety over its category, and a plant's owner over both
-- (null pauses that kind). Kinds left out fall back to the app's defaults.

alter table catalog_categories add column care jsonb;
alter table catalog_subcategories add column care jsonb;
alter table plants add column care jsonb;

-- Care tasks gain feeding, repotting and turning to the light.
alter table todos drop constraint todos_subcategory_check;
alter table todos add constraint todos_subcategory_check
  check (subcategory in ('water', 'photo', 'feed', 'repot', 'rotate'));
