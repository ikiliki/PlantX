import type pg from 'pg'
import {
  defaultIdentifySettings,
  mergeIdentifySettings,
  parseIdentifySettings,
} from '../../../../src/mock/identifySettings.ts'
import type { IdentifyProviderId, IdentifyProviderSettings } from '../../../../src/mock/types.ts'
import { AppError } from '../../lib/errors.ts'
import { logger } from '../../lib/logger.ts'
import type { PlantxStore } from '../store.ts'

const UNDEFINED_TABLE = '42P01'
const UNDEFINED_COLUMN = '42703'

const ENSURE_CONFIG = `
alter table identify_provider_settings
  add column if not exists config jsonb not null default '{}'::jsonb`

function isCode(err: unknown, code: string) {
  return (err as { code?: string } | null)?.code === code
}

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

/** A missing table reads as all enabled and ready. Saving needs the table. */
export function supabaseIdentifySettings(pool: pg.Pool): PlantxStore['identifySettings'] {
  let warnedMissing = false

  async function ensureConfig() {
    try {
      await pool.query(ENSURE_CONFIG)
    } catch (err) {
      if (!isCode(err, UNDEFINED_TABLE)) throw err
    }
  }

  return {
    async get() {
      await ensureConfig()
      try {
        const result = await pool.query('select provider_id, enabled, config from identify_provider_settings')
        const flags: Partial<Record<IdentifyProviderId, IdentifyProviderSettings>> = {}
        for (const row of result.rows as {
          provider_id: IdentifyProviderId
          enabled: boolean
          config: unknown
        }[]) {
          flags[row.provider_id] = parseIdentifySettings(Boolean(row.enabled), row.config)
        }
        return flags
      } catch (err) {
        if (isCode(err, UNDEFINED_COLUMN)) {
          const result = await pool.query('select provider_id, enabled from identify_provider_settings')
          const flags: Partial<Record<IdentifyProviderId, IdentifyProviderSettings>> = {}
          for (const row of result.rows as { provider_id: IdentifyProviderId; enabled: boolean }[]) {
            flags[row.provider_id] = defaultIdentifySettings(Boolean(row.enabled))
          }
          return flags
        }
        if (!isCode(err, UNDEFINED_TABLE)) throw err
        if (!warnedMissing) {
          warnedMissing = true
          logger.warn('identify_provider_settings table missing; all providers read as enabled. Apply supabase/migrations.')
        }
        return {}
      }
    },

    async save(id, patch) {
      await ensureConfig()
      const current = (await this.get())[id] ?? defaultIdentifySettings(true)
      const next = mergeIdentifySettings(current, patch)
      try {
        await pool.query(
          `insert into identify_provider_settings (provider_id, enabled, updated_at, config)
           values ($1, $2, $3, $4::jsonb)
           on conflict (provider_id) do update set
             enabled = excluded.enabled,
             updated_at = excluded.updated_at,
             config = excluded.config`,
          [id, next.enabled, new Date().toISOString(), JSON.stringify(configOf(next))],
        )
      } catch (err) {
        if (!isCode(err, UNDEFINED_TABLE) && !isCode(err, UNDEFINED_COLUMN)) throw err
        throw new AppError(
          503,
          'unavailable',
          'identify_provider_settings table is missing. Apply supabase/migrations/20261001160000_identify_provider_settings.sql.',
        )
      }
    },
  }
}
