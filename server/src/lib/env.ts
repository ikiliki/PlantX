export type PlantxEnv = 'mock' | 'qa' | 'prod'
export type PlantxSeed = 'empty' | 'demo'
export type PlantxDb = 'supabase'

function normalizeEnv(raw: string | undefined): PlantxEnv {
  const value = (raw || '').trim().toLowerCase()
  if (value === 'prod' || value === 'production') return 'prod'
  if (value === 'qa' || value === 'staging') return 'qa'
  if (value === 'mock' || value === 'demo' || value === 'local') return 'mock'
  return 'qa'
}

/**
 * mock → browser UI only. This process should not be started for it.
 * qa → local Docker Supabase (`npm run dev:qa`).
 * prod → hosted Supabase (`npm run dev:prod`). On Vercel this is the default.
 */
export function plantxEnv(): PlantxEnv {
  if (!(process.env.PLANTX_ENV || '').trim() && process.env.VERCEL) return 'prod'
  return normalizeEnv(process.env.PLANTX_ENV)
}

/** The API always uses the Supabase driver. Mock mode never starts this process. */
export function plantxDb(): PlantxDb {
  return 'supabase'
}

/**
 * What to write when the database has not been seeded.
 * mock → demo fixtures. qa and prod → empty live (bootstrap admin, one category).
 * PLANTX_SEED overrides when set explicitly.
 */
export function plantxSeed(): PlantxSeed {
  const explicit = (process.env.PLANTX_SEED || '').trim().toLowerCase()
  if (explicit === 'demo') return 'demo'
  if (explicit === 'empty') return 'empty'
  return plantxEnv() === 'mock' ? 'demo' : 'empty'
}

/**
 * The operator's Google account (`PLANTX_BOOTSTRAP_ADMIN_EMAIL`), the only one Google sign-in makes admin.
 * Unset → Google never grants admin; the existing admin row keeps its role.
 */
export function bootstrapAdminEmail(): string | null {
  return (process.env.PLANTX_BOOTSTRAP_ADMIN_EMAIL || '').trim().toLowerCase() || null
}

export function plantxEnvLabel(env: PlantxEnv = plantxEnv()): string {
  if (env === 'mock') return 'local · ui mocks'
  if (env === 'prod') return 'prod · hosted supabase'
  return 'qa · docker'
}
