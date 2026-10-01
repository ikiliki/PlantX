/**
 * Default for `system.launched` when nothing has been saved yet.
 * Admin → System is the switch visitors follow after that.
 * Production stays closed. Local mocks and QA stay open until a saved value exists.
 */
export function defaultAppLaunched() {
  const serverEnv = typeof process !== 'undefined' ? process.env?.PLANTX_ENV : undefined
  if (serverEnv === 'prod') return false
  if (serverEnv === 'qa' || serverEnv === 'local' || serverEnv === 'mock') return true
  const meta = import.meta as { env?: { VITE_PLANTX_ENV?: string } }
  return meta.env?.VITE_PLANTX_ENV !== 'prod'
}
