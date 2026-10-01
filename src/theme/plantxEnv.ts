export type ClientEnv = 'mock' | 'qa' | 'prod'

/** local and mock are the browser UI. qa and prod talk to a server. */
export function clientEnv(): ClientEnv {
  const raw = String(import.meta.env.VITE_PLANTX_ENV || 'mock')
    .trim()
    .toLowerCase()
  if (raw === 'prod' || raw === 'production') return 'prod'
  if (raw === 'qa' || raw === 'staging') return 'qa'
  return 'mock'
}

export function clientEnvLabel(env: ClientEnv = clientEnv()) {
  if (env === 'mock') return 'local · ui mocks'
  if (env === 'prod') return 'prod · hosted supabase'
  return 'qa · docker'
}
