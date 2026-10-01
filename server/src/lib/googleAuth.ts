import { AppError, Errors } from './errors.ts'
import { logger } from './logger.ts'

export type GoogleProfile = {
  email: string
  name: string
  picture?: string
  sub: string
}

type GoogleClaims = {
  aud?: string | string[]
  iss?: string
  exp?: number
  email?: string
  email_verified?: boolean | string
  name?: string
  picture?: string
  sub?: string
}

const GOOGLE_ISSUERS = new Set(['accounts.google.com', 'https://accounts.google.com'])

/** Google OAuth Web client id (same value as VITE_GOOGLE_CLIENT_ID). */
export function googleClientId() {
  return (process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '').trim()
}

export function googleAuthEnabled() {
  return Boolean(googleClientId())
}

function decodeJwtPayload(credential: string): GoogleClaims {
  const parts = credential.split('.')
  if (parts.length !== 3) throw Errors.auth('Invalid Google credential')
  try {
    const json = Buffer.from(parts[1]!, 'base64url').toString('utf8')
    return JSON.parse(json) as GoogleClaims
  } catch {
    throw Errors.auth('Invalid Google credential')
  }
}

function audienceMatches(aud: string | string[] | undefined, clientId: string) {
  if (!aud) return false
  return Array.isArray(aud) ? aud.includes(clientId) : aud === clientId
}

function profileFromClaims(payload: GoogleClaims, clientId: string): GoogleProfile {
  if (!audienceMatches(payload.aud, clientId)) throw Errors.auth('Google client mismatch')
  if (!payload.iss || !GOOGLE_ISSUERS.has(payload.iss)) throw Errors.auth('Invalid Google issuer')
  if (!payload.exp || payload.exp * 1000 < Date.now() - 60_000) throw Errors.auth('Google credential expired')
  const verified = payload.email_verified === true || payload.email_verified === 'true'
  if (!payload.email || !verified) throw Errors.auth('Google email not verified')
  if (!payload.sub) throw Errors.auth('Invalid Google subject')

  return {
    email: payload.email.toLowerCase(),
    name: payload.name?.trim() || payload.email.split('@')[0] || 'Grower',
    picture: payload.picture,
    sub: payload.sub,
  }
}

async function verifyViaTokenInfo(credential: string, clientId: string): Promise<GoogleProfile> {
  const url = new URL('https://oauth2.googleapis.com/tokeninfo')
  url.searchParams.set('id_token', credential)
  const res = await fetch(url)
  if (!res.ok) throw Errors.auth('Invalid Google credential')
  return profileFromClaims((await res.json()) as GoogleClaims, clientId)
}

function isNetworkFailure(err: unknown) {
  if (!(err instanceof Error)) return false
  if (err instanceof AppError) return false
  return /fetch failed|certificate|ECONN|ENOTFOUND|TLS|UNABLE_TO_VERIFY/i.test(
    `${err.message} ${err.cause instanceof Error ? err.cause.message : ''}`,
  )
}

/**
 * Verify a Google Identity Services ID token.
 * Prefers Google tokeninfo; if TLS/network blocks Google (common on locked-down Windows),
 * falls back to local JWT claim checks (aud/iss/exp/email) for local development.
 */
export async function verifyGoogleIdToken(credential: string): Promise<GoogleProfile> {
  const clientId = googleClientId()
  if (!clientId) throw Errors.invalid('Google sign-in is not configured')
  if (!credential.trim()) throw Errors.invalid('Missing Google credential')

  try {
    return await verifyViaTokenInfo(credential, clientId)
  } catch (err) {
    if (err instanceof AppError) throw err
    if (!isNetworkFailure(err)) throw Errors.auth('Invalid Google credential')

    logger.info('Google tokeninfo unreachable; validating ID token claims locally', {
      reason: err instanceof Error ? err.message : 'network',
    })
    return profileFromClaims(decodeJwtPayload(credential), clientId)
  }
}
