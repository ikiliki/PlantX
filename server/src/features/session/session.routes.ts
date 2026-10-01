import { Hono } from 'hono'
import { Errors } from '../../lib/errors.ts'
import { googleAuthEnabled, googleClientId, verifyGoogleIdToken } from '../../lib/googleAuth.ts'
import { setSession } from '../../lib/session.ts'
import { liveService } from '../live/live.service.ts'
import { usersService } from '../users/users.service.ts'
import { sessionService } from './session.service.ts'

export const sessionRoutes = new Hono()

sessionRoutes.get('/google', (c) =>
  c.json({
    enabled: googleAuthEnabled(),
    clientId: googleAuthEnabled() ? googleClientId() : null,
  }),
)

sessionRoutes.post('/', async (c) => {
  const body = (await c.req.json()) as { email?: string; userId?: string | null }
  if (body.userId === null || body.email === '') {
    setSession(c, null)
    return c.json(await liveService.payload(null))
  }

  let user
  if (body.userId) user = await sessionService.requireById(body.userId)
  else if (body.email) user = await sessionService.requireByEmail(body.email)
  else throw Errors.invalid('email or userId required')

  setSession(c, user.id)
  return c.json(await liveService.payload(user.id))
})

sessionRoutes.post('/google', async (c) => {
  const body = (await c.req.json()) as { credential?: string }
  const profile = await verifyGoogleIdToken(body.credential ?? '')
  const user = await sessionService.loginWithGoogle(profile)
  setSession(c, user.id)
  return c.json(await liveService.payload(user.id))
})

/** Legacy path — same as POST /api/users/pending (no session until approved). */
sessionRoutes.post('/register', async (c) => {
  const body = (await c.req.json()) as { name?: string; email?: string }
  const pending = await usersService.requestAccess({ name: body.name ?? '', email: body.email ?? '' })
  return c.json({ pending }, 201)
})
