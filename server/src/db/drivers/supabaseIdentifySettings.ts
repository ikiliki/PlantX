import type pg from 'pg'
import type { IdentifyProviderId } from '../../../../src/mock/types.ts'
import { AppError } from '../../lib/errors.ts'
import { logger } from '../../lib/logger.ts'
import type { PlantxStore } from '../store.ts'

const UNDEFINED_TABLE = '42P01'

function isMissingTable(err: unknown) {
  return (err as { code?: string } | null)?.code === UNDEFINED_TABLE
}

/** A missing table reads as all enabled; saving needs the migration. */
export function supabaseIdentifySettings(pool: pg.Pool): PlantxStore['identifySettings'] {
  let warnedMissing = false

  return {
    async get() {
      try {
        const result = await pool.query('select provider_id, enabled from identify_provider_settings')
        const flags: Partial<Record<IdentifyProviderId, boolean>> = {}
        for (const row of result.rows as { provider_id: IdentifyProviderId; enabled: boolean }[]) {
          flags[row.provider_id] = Boolean(row.enabled)
        }
        return flags
      } catch (err) {
        if (!isMissingTable(err)) throw err
        if (!warnedMissing) {
          warnedMissing = true
          logger.warn('identify_provider_settings table missing; all providers read as enabled. Apply supabase/migrations.')
        }
        return {}
      }
    },

    async save(id, enabled) {
      try {
        await pool.query(
          `insert into identify_provider_settings (provider_id, enabled, updated_at)
           values ($1, $2, $3)
           on conflict (provider_id) do update set enabled = excluded.enabled, updated_at = excluded.updated_at`,
          [id, enabled, new Date().toISOString()],
        )
      } catch (err) {
        if (!isMissingTable(err)) throw err
        throw new AppError(
          503,
          'unavailable',
          'identify_provider_settings table is missing. Apply supabase/migrations/20261001160000_identify_provider_settings.sql.',
        )
      }
    },
  }
}
