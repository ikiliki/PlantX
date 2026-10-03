import { Hono } from 'hono'
import { plantxEnv } from '../../lib/env.ts'
import { Errors } from '../../lib/errors.ts'
import { googleAuthEnabled, googleClientId, verifyGoogleIdToken } from '../../lib/googleAuth.ts'
import { requireUser, setSession } from '../../lib/session.ts'
import { liveService } from '../live/live.service.ts'
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

sessionRoutes.post('/google', async (c) => {
  const body = (await c.req.json()) as { credential?: string }
  const profile = await verifyGoogleIdToken(body.credential ?? '')
  const user = await sessionService.loginWithGoogle(profile)
  await setSession(c, user.id)
  return c.json(await liveService.payload(user.id))
})
