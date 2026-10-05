import { createPublicKey, verify, type KeyObject } from 'node:crypto'
import { Errors } from './errors.ts'
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

type JwtHeader = { alg?: string; kid?: string }

const GOOGLE_ISSUERS = new Set(['accounts.google.com', 'https://accounts.google.com'])
const GOOGLE_CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs'
/** Used when Google sends no max-age. Google rotates keys about weekly and keeps old ones listed. */
const DEFAULT_KEYS_TTL_MS = 60 * 60 * 1000
/** A token signed with a key we have not seen refetches at most this often. */
const REFETCH_GAP_MS = 60 * 1000

/** Google OAuth Web client id (same value as VITE_GOOGLE_CLIENT_ID). */
export function googleClientId() {
  return (process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '').trim()
}

export function googleAuthEnabled() {
  return Boolean(googleClientId())
}

/**
 * Local development only: a locked-down machine that cannot reach Google may skip the signature.
 * Ignored on every Vercel deployment (production and PP previews).
 */
function insecureLocalAllowed() {
  return process.env.PLANTX_GOOGLE_INSECURE_LOCAL === '1' && !process.env.VERCEL
}

function decodePart<T>(part: string | undefined): T {
  if (!part) throw Errors.auth('Invalid Google credential')
  try {
    return JSON.parse(Buffer.from(part, 'base64url').toString('utf8')) as T
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

let keys = new Map<string, KeyObject>()
let keysExpireAt = 0
let lastFetchAt = 0

async function fetchKeys() {
  lastFetchAt = Date.now()
  const res = await fetch(GOOGLE_CERTS_URL)
  if (!res.ok) throw new Error(`Google certs HTTP ${res.status}`)
  const body = (await res.json()) as { keys?: (JsonWebKey & { kid?: string; kty?: string })[] }
  const next = new Map<string, KeyObject>()
  for (const jwk of body.keys ?? []) {
    if (jwk.kid && jwk.kty === 'RSA') next.set(jwk.kid, createPublicKey({ key: jwk, format: 'jwk' }))
  }
  if (next.size === 0) throw new Error('Google certs had no RSA keys')
  const maxAge = Number(res.headers.get('cache-control')?.match(/max-age=(\d+)/)?.[1])
  keys = next
  keysExpireAt = Date.now() + (maxAge > 0 ? maxAge * 1000 : DEFAULT_KEYS_TTL_MS)
}

/** Google's signing key for `kid`. Unknown or unreachable → the sign-in fails. */
async function signingKey(kid: string) {
  const stale = Date.now() >= keysExpireAt
  const unseen = !keys.has(kid) && Date.now() - lastFetchAt >= REFETCH_GAP_MS
  if (stale || unseen) {
    try {
      await fetchKeys()
    } catch (err) {
      logger.warn('Google signing keys unreachable; refusing sign-in', undefined, err)
      throw Errors.auth('Google sign-in is unavailable right now. Try again in a minute.')
    }
  }
  const key = keys.get(kid)
  if (!key) throw Errors.auth('Invalid Google credential')
  return key
}

/**
 * Verify a Google Identity Services ID token: RS256 signature against Google's published keys,
 * then audience, issuer, expiry and verified email. There is no unsigned fallback.
 */
export async function verifyGoogleIdToken(credential: string): Promise<GoogleProfile> {
  const clientId = googleClientId()
  if (!clientId) throw Errors.invalid('Google sign-in is not configured')
  const token = credential.trim()
  if (!token) throw Errors.invalid('Missing Google credential')

  const parts = token.split('.')
  if (parts.length !== 3) throw Errors.auth('Invalid Google credential')
  const header = decodePart<JwtHeader>(parts[0])
  const claims = decodePart<GoogleClaims>(parts[1])

  if (insecureLocalAllowed()) {
    logger.warn('PLANTX_GOOGLE_INSECURE_LOCAL=1: Google signature not checked (local only)')
    return profileFromClaims(claims, clientId)
  }

  if (header.alg !== 'RS256' || !header.kid) throw Errors.auth('Invalid Google credential')
  const key = await signingKey(header.kid)
  const signed = verify(
    'RSA-SHA256',
    Buffer.from(`${parts[0]}.${parts[1]}`),
    key,
    Buffer.from(parts[2]!, 'base64url'),
  )
  if (!signed) throw Errors.auth('Invalid Google credential')
  return profileFromClaims(claims, clientId)
}
