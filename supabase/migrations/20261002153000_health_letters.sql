-- Health letters are S (best) through D (low end). Size stays S/M/L/XL.

alter table plants drop constraint if exists plants_quality_check;
alter table plants add constraint plants_quality_check
  check (quality is null or quality in ('S', 'A', 'B', 'C', 'D'));

alter table plant_grades drop constraint if exists plant_grades_letter_check;
alter table plant_grades add constraint plant_grades_letter_check
  check (letter in ('S', 'A', 'B', 'C', 'D'));
