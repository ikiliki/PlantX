-- Plant.id is no longer a provider. Historical rows move off that id.

update identify_requests set target = 'chain' where target = 'plantid';

delete from identify_provider_settings where provider_id = 'plantid';

update plant_identifications set provider = null where provider = 'plantid';

update plant_photo_checks set provider = null where provider = 'plantid';

alter table identify_requests drop constraint if exists identify_requests_target_check;
alter table identify_requests
  add constraint identify_requests_target_check
  check (target in ('chain', 'plantnet', 'gemini'));

alter table identify_provider_settings drop constraint if exists identify_provider_settings_provider_id_check;
alter table identify_provider_settings
  add constraint identify_provider_settings_provider_id_check
  check (provider_id in ('plantnet', 'gemini'));

alter table plant_identifications drop constraint if exists plant_identifications_provider_check;
alter table plant_identifications
  add constraint plant_identifications_provider_check
  check (provider is null or provider in ('plantnet', 'gemini'));

alter table plant_photo_checks drop constraint if exists plant_photo_checks_provider_check;
alter table plant_photo_checks
  add constraint plant_photo_checks_provider_check
  check (provider is null or provider in ('plantnet', 'gemini'));
