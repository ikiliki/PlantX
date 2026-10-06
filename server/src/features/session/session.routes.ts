import { Hono } from 'hono'
import { plantxEnv } from '../../lib/env.ts'
import { Errors } from '../../lib/errors.ts'
import { googleAuthEnabled, googleClientId, verifyGoogleIdToken } from '../../lib/googleAuth.ts'
import { checkTestToken, preprodEnabled } from '../../lib/preprod.ts'
import { requireUser, setSession } from '../../lib/session.ts'
import { liveService } from '../live/live.service.ts'
import { rateLimit } from '../../lib/rateLimit.ts'
import { sessionService } from './session.service.ts'

export const sessionRoutes = new Hono()

sessionRoutes.get('/google', (c) =>
  c.json({
    enabled: googleAuthEnabled(),
    clientId: googleAuthEnabled() ? googleClientId() : null,
  }),
)

/**
 * Sign out with `{ userId: null }`. Sign-in by id or email has no password, so it exists only on the
 * local QA database (verification scripts use it); production signs in through Google only.
 */
/**
 * Google sign-in attempts per IP (#57). Not on POST /: its passwordless sign-in exists only on local QA,
 * where e2e signs in once per test and would hit the limit.
 */
const signInLimit = rateLimit({ name: 'session', max: 30, windowSeconds: 600, by: 'ip' })

sessionRoutes.post('/', async (c) => {
  const body = (await c.req.json()) as { email?: string; userId?: string | null }
  if (body.userId === null || body.email === '') {
    await setSession(c, null)
    return c.json(await liveService.payload(null))
  }
  if (plantxEnv() === 'prod') throw Errors.missing()

  let user
  if (body.userId) user = await sessionService.requireById(body.userId)
  else if (body.email) user = await sessionService.requireByEmail(body.email)
  else throw Errors.invalid('email or userId required')

  await setSession(c, user.id)
  return c.json(await liveService.payload(user.id))
})

/** Owner-only. The nickname is the public name. The icon has to be unlocked for this greenhouse. */
sessionRoutes.patch('/account', async (c) => {
  const user = await requireUser(c)
  const body = (await c.req.json().catch(() => ({}))) as { nickname?: unknown; avatarIcon?: unknown }
  const next = await sessionService.updateAccount(user.id, {
    nickname: typeof body.nickname === 'string' ? body.nickname : undefined,
    avatarIcon: typeof body.avatarIcon === 'string' ? body.avatarIcon : undefined,
  })
  return c.json({ user: next })
})

/** The signed-in member agrees to the current Terms and Privacy Policy (the consent dialog). */
sessionRoutes.post('/consent', async (c) => {
  const user = await requireUser(c)
  const body = (await c.req.json().catch(() => ({}))) as { version?: unknown }
  return c.json({ user: await sessionService.acceptTerms(user.id, body.version) })
})

/** The member deletes their own account (Account → Delete my account) and is signed out. */
sessionRoutes.delete('/account', async (c) => {
  const user = await requireUser(c)
  await sessionService.deleteAccount(user.id)
  await setSession(c, null)
  return c.json(await liveService.payload(null))
})

/** Preprod only: sign in as a seeded user with the test token. Scripts use POST + header. */
sessionRoutes.post('/test-login', async (c) => {
  if (!preprodEnabled()) throw Errors.missing()
  if (!checkTestToken(c.req.header('x-test-token'))) throw Errors.auth('Bad test token')
  const body = (await c.req.json().catch(() => ({}))) as { userId?: string }
  if (!body.userId) throw Errors.invalid('userId required')
  const user = await sessionService.requireById(body.userId)
  await setSession(c, user.id)
  // No live payload: callers reload (PP bar) or fetch /api/live themselves, so switching stays fast.
  return c.json({ ok: true, userId: user.id })
})

/** Preprod only: who the PP bar can switch to. Ids and names only; signing in still needs the token. */
sessionRoutes.get('/test-users', async (c) => {
  if (!preprodEnabled()) throw Errors.missing()
  const users = await sessionService.listActive()
  return c.json({ users: users.map((user) => ({ id: user.id, name: user.name, role: user.role })) })
})

/** Preprod only: one link for browser AI agents that cannot set headers. Rotate the token after a run. */
sessionRoutes.get('/test-login', async (c) => {
  if (!preprodEnabled()) throw Errors.missing()
  if (!checkTestToken(c.req.query('token'))) throw Errors.auth('Bad test token')
  const user = await sessionService.requireById(c.req.query('user') ?? '')
  await setSession(c, user.id)
  return c.redirect('/greenhouse', 302)
})

sessionRoutes.post('/google', signInLimit, async (c) => {
  const body = (await c.req.json()) as { credential?: string; termsVersion?: unknown }
  const profile = await verifyGoogleIdToken(body.credential ?? '')
  const user = await sessionService.loginWithGoogle(profile, body.termsVersion)
  await setSession(c, user.id)
  return c.json(await liveService.payload(user.id))
})
