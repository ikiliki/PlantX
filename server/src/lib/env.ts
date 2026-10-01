export type PlantxEnv = 'mock' | 'local' | 'prod'
export type PlantxSeed = 'empty' | 'demo'

function normalizeEnv(raw: string | undefined): PlantxEnv {
  const value = (raw || '').trim().toLowerCase()
  if (value === 'mock' || value === 'demo') return 'mock'
  if (value === 'prod' || value === 'production') return 'prod'
  if (value === 'local' || value === 'qa' || value === 'staging') return 'local'
  return 'local'
}

/**
 * mock → development fixtures.
 * local → clean JSON db you run on this machine.
 * prod → clean JSON db for the deployed client → server → storage stack.
 */
export function plantxEnv(): PlantxEnv {
  return normalizeEnv(process.env.PLANTX_ENV)
}

/**
 * Which JSON world to seed when the data folder is empty.
 * mock → demo fixtures. local and prod → empty live (bootstrap admin only).
 * PLANTX_SEED overrides when set explicitly.
 */
export function plantxSeed(): PlantxSeed {
  const explicit = (process.env.PLANTX_SEED || '').trim().toLowerCase()
  if (explicit === 'demo') return 'demo'
  if (explicit === 'empty') return 'empty'
  return plantxEnv() === 'mock' ? 'demo' : 'empty'
}

export function plantxEnvLabel(env: PlantxEnv = plantxEnv()): string {
  if (env === 'mock') return 'mock · demo'
  if (env === 'prod') return 'prod · json db'
  return 'local · json db'
}
