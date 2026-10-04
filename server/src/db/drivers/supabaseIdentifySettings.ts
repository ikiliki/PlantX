import type pg from 'pg'
import {
  defaultIdentifySettings,
  mergeIdentifySettings,
  parseIdentifySettings,
} from '../../../../src/mock/identifySettings.ts'
import type { IdentifyProviderId, IdentifyProviderSettings } from '../../../../src/mock/types.ts'
import type { PlantxStore } from '../store.ts'

function configOf(settings: IdentifyProviderSettings) {
  const config: Record<string, unknown> = {
    response: settings.response,
    scenario: settings.scenario,
    match: settings.match,
    suggestionId: settings.suggestionId,
  }
  if (settings.gate) {
    config.gate = { ...configOf(settings.gate), enabled: settings.gate.enabled }
  }
  if (settings.draft) {
    config.draft = { ...configOf(settings.draft), enabled: settings.draft.enabled }
  }
  return config
}

export function supabaseIdentifySettings(pool: pg.Pool): PlantxStore['identifySettings'] {
  return {
    async get() {
      const result = await pool.query('select provider_id, enabled, config from identify_provider_settings')
      const flags: Partial<Record<IdentifyProviderId, IdentifyProviderSettings>> = {}
      for (const row of result.rows as { provider_id: IdentifyProviderId; enabled: boolean; config: unknown }[]) {
        flags[row.provider_id] = parseIdentifySettings(Boolean(row.enabled), row.config)
      }
      return flags
    },

    async save(id, patch) {
      const current = (await this.get())[id] ?? defaultIdentifySettings(true)
      const next = mergeIdentifySettings(current, patch)
      await pool.query(
        `insert into identify_provider_settings (provider_id, enabled, updated_at, config)
         values ($1, $2, $3, $4::jsonb)
         on conflict (provider_id) do update set
           enabled = excluded.enabled,
           updated_at = excluded.updated_at,
           config = excluded.config`,
        [id, next.enabled, new Date().toISOString(), JSON.stringify(configOf(next))],
      )
    },
  }
}
