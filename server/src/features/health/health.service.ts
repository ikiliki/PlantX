import { readdirSync } from 'node:fs'
import type { SystemHealth } from '../../../../src/mock/types.ts'
import path from 'node:path'
import { explainDbError, getStore } from '../../db/index.ts'
import { plantxEnv } from '../../lib/env.ts'
import { alertsConfigured, failureSummary } from '../../lib/observability.ts'
import { missingEnv } from '../../lib/requiredEnv.ts'

/** Short git sha on Vercel; `dev` locally. */
function version() {
  return (process.env.VERCEL_GIT_COMMIT_SHA || process.env.PLANTX_VERSION || 'dev').slice(0, 7)
}

/**
 * The newest migration in this build. `build-prod.mjs` bakes it in (the function has no migrations folder);
 * a local server reads `supabase/migrations`.
 */
function expectedMigration(): string | null {
  const baked = (process.env.PLANTX_LATEST_MIGRATION || '').trim()
  if (baked) return baked
  try {
    const files = readdirSync(path.join(process.cwd(), 'supabase', 'migrations')).filter((name) => name.endsWith('.sql'))
    const newest = files.sort().at(-1)
    return newest ? newest.split('_')[0] : null
  } catch {
    return null
  }
}

export const healthService = {
  /** Public and cheap: no database, no session. */
  ping() {
    return { ok: true, version: version(), env: plantxEnv() }
  },

  /**
   * Admin → System health (#56). Never calls a live identify provider: "configured" means the keys are set.
   * Error counts are this instance's since it started.
   */
  async system(): Promise<SystemHealth> {
    const started = performance.now()
    let database: { ok: boolean; ms: number; error: string | null }
    let applied: string | null = null
    try {
      applied = (await getStore().health()).migration
      database = { ok: true, ms: Math.round(performance.now() - started), error: null }
    } catch (err) {
      database = { ok: false, ms: Math.round(performance.now() - started), error: explainDbError(err).message }
    }
    const missing = missingEnv()
    const identifyMissing = missing.filter((gap) => gap.need === 'identify').length
    return {
      checkedAt: new Date().toISOString(),
      api: {
        ok: true,
        version: version(),
        env: plantxEnv(),
        region: process.env.VERCEL_REGION || null,
      },
      database,
      migration: { applied, expected: expectedMigration() },
      identify: { ready: identifyMissing === 0, missing: identifyMissing },
      missing,
      errors: failureSummary(),
      alerts: { configured: alertsConfigured() },
    }
  },
}

