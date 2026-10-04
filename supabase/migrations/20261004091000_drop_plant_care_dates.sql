-- Care dates live on todos. Drop the old per-plant copies.

alter table plants drop column photo_at, drop column watered_at;
