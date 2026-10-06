-- Admin on/off switch per outgoing webhook (Admin → Webhooks). No row means on.
-- The webhook URLs stay in env (PLANTX_ALERT_WEBHOOK_URL, PLANTX_EVENTS_WEBHOOK_URL), never in the database.

create table webhook_settings (
  webhook_id text primary key check (webhook_id in ('alerts', 'signups', 'signins', 'activities')),
  enabled boolean not null,
  updated_at text not null
);

alter table webhook_settings enable row level security;
