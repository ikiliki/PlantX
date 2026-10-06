-- Plant privacy and owner activity (#80).
-- A private plant, and every activity about it, is seen only by its owner and admins. Default: public.
-- Owners can now delete their own plant (soft: visibility 'deleted', as an admin delete), and editing
-- or deleting a plant writes a private activity row ('edited', 'deleted').

alter table plants
  add column is_private boolean not null default false;

alter table activities drop constraint activities_kind_check;

alter table activities
  add constraint activities_kind_check
  check (kind in ('photo', 'water', 'propagate', 'grade', 'passport', 'listing', 'scan', 'added', 'edited', 'deleted'));
