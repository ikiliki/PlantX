import { Errors } from './errors.ts'
import { logger } from './logger.ts'
import { preprodEnabled } from './preprod.ts'

/**
 * Email + password sign-in through the PP project's Supabase Auth. Supabase keeps the passwords; PlantX only
 * learns that the email is verified and signs its own session cookie, as with Google. PP only for now.
 * The URL and key stay on the server.
 */
function config() {
  const url = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '')
  const key = (process.env.SUPABASE_ANON_KEY || '').trim()
  return url && key ? { url, key } : null
}

export function passwordAuthEnabled() {
  return preprodEnabled() && Boolean(config())
}

export const PASSWORD_MIN = 8

type AuthAnswer = {
  user?: { email?: string }
  access_token?: string
  error_code?: string
  code?: string | number
  msg?: string
  message?: string
  error_description?: string
}

async function call(path: string, body: Record<string, unknown>) {
  const auth = config()
  if (!auth || !preprodEnabled()) throw Errors.missing()
  let res: Response
  try {
    res = await fetch(`${auth.url}/auth/v1/${path}`, {
      method: 'POST',
      headers: { apikey: auth.key, 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    })
  } catch (error) {
    logger.error('password auth unreachable', {}, error)
    throw Errors.internal('Sign-in is unavailable. Try again in a moment.')
  }
  const answer = (await res.json().catch(() => ({}))) as AuthAnswer
  return { res, answer, code: answer.error_code ?? String(answer.code ?? '') }
}

/** A verified email for a correct password, or 401. */
export async function signInWithPassword(email: string, password: string) {
  const { res, answer, code } = await call('token?grant_type=password', { email, password })
  if (res.ok && answer.user?.email) return answer.user.email.toLowerCase()
  if (res.status === 429 || code === 'over_request_rate_limit') throw Errors.rateLimited(60)
  if (code === 'email_not_confirmed') throw Errors.auth('Confirm your email first')
  throw Errors.auth('Wrong email or password')
}

/**
 * Creates the Supabase login and returns its email. PP turns email confirmation off, so the login is usable
 * at once; with it on, Supabase returns no session and this says so instead of half-signing up.
 */
export async function signUpWithPassword(email: string, password: string) {
  const { res, answer, code } = await call('signup', { email, password })
  if (res.ok && answer.access_token && answer.user?.email) return answer.user.email.toLowerCase()
  if (res.ok) throw Errors.invalid('Email confirmation is on for this environment; sign-up needs it off')
  if (res.status === 429 || code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit') {
    throw Errors.rateLimited(60)
  }
  if (code === 'user_already_exists' || code === 'email_exists') throw Errors.exists('This email already has an account. Sign in instead.')
  if (code === 'weak_password') throw Errors.invalid(`Use a stronger password (at least ${PASSWORD_MIN} characters)`)
  if (code === 'email_address_invalid' || code === 'validation_failed') throw Errors.invalid('Enter a valid email')
  logger.error('password sign-up refused', { status: res.status, code })
  throw Errors.invalid(answer.msg || answer.message || answer.error_description || 'Sign-up failed')
}
