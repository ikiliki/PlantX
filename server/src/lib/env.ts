export type PlantxEnv = 'mock' | 'qa' | 'prod'
export type PlantxSeed = 'empty' | 'demo'

function normalizeEnv(raw: string | undefined): PlantxEnv {
  const value = (raw || '').trim().toLowerCase()
  if (value === 'prod' || value === 'production') return 'prod'
  if (value === 'qa' || value === 'staging') return 'qa'
  if (value === 'mock' || value === 'demo' || value === 'local') return 'mock'
  return 'qa'
}

/**
 * mock → browser UI only. This process should not be started for it.
 * qa → QA database. JSON files in server/data until a separate QA database exists.
 * prod → production database. JSON files on the Vercel server (server/data-prod when run here).
 */
export function plantxEnv(): PlantxEnv {
  return normalizeEnv(process.env.PLANTX_ENV)
}

/**
 * Which JSON world to seed when the data folder is empty.
 * mock → demo fixtures. qa and prod → empty live (bootstrap admin only).
 * PLANTX_SEED overrides when set explicitly.
 */
export function plantxSeed(): PlantxSeed {
  const explicit = (process.env.PLANTX_SEED || '').trim().toLowerCase()
  if (explicit === 'demo') return 'demo'
  if (explicit === 'empty') return 'empty'
  return plantxEnv() === 'mock' ? 'demo' : 'empty'
}

export function plantxEnvLabel(env: PlantxEnv = plantxEnv()): string {
  if (env === 'mock') return 'local · ui mocks'
  if (env === 'prod') return 'prod · json db'
  return 'qa · json db'
}
