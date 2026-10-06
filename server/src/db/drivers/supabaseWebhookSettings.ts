import type pg from 'pg'
import type { WebhookId } from '../../../../src/mock/types.ts'
import type { PlantxStore } from '../store.ts'

export function supabaseWebhookSettings(pool: pg.Pool): PlantxStore['webhookSettings'] {
  return {
    async get() {
      const result = await pool.query('select webhook_id, enabled from webhook_settings')
      const flags: Partial<Record<WebhookId, boolean>> = {}
      for (const row of result.rows as { webhook_id: WebhookId; enabled: boolean }[]) flags[row.webhook_id] = Boolean(row.enabled)
      return flags
    },

    async set(id, enabled) {
      await pool.query(
        `insert into webhook_settings (webhook_id, enabled, updated_at) values ($1, $2, $3)
         on conflict (webhook_id) do update set enabled = excluded.enabled, updated_at = excluded.updated_at`,
        [id, enabled, new Date().toISOString()],
      )
    },
  }
}
