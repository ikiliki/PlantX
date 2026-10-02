export type EnvNeed = 'app' | 'identify'

/** A name the process expected and did not get. Values are never included. */
export type EnvGap = {
  name: string
  need: EnvNeed
}

function set(...keys: string[]) {
  return keys.some((key) => Boolean((process.env[key] || '').trim()))
}

/** Required names that are empty. Photo-identify keys are listed apart from sign-in. */
export function missingEnv(): EnvGap[] {
  const gaps: EnvGap[] = []
  if (!set('DATABASE_URL', 'PROD_DATABASE_URL')) gaps.push({ name: 'DATABASE_URL', need: 'app' })
  if (!set('GOOGLE_CLIENT_ID', 'VITE_GOOGLE_CLIENT_ID')) gaps.push({ name: 'GOOGLE_CLIENT_ID', need: 'app' })
  if (!set('PLANTNET_API_KEY')) gaps.push({ name: 'PLANTNET_API_KEY', need: 'identify' })
  if (!set('GEMINI_API_KEY')) gaps.push({ name: 'GEMINI_API_KEY', need: 'identify' })
  return gaps
}
