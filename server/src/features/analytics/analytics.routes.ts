import { Hono } from 'hono'
import { Errors } from '../../lib/errors.ts'
import { rateLimit } from '../../lib/rateLimit.ts'
import { requireAdmin, userFromSession } from '../../lib/session.ts'
import { analyticsService } from './analytics.service.ts'

export const analyticsRoutes = new Hono()

/** Browser funnel steps (landing view, guest start, sign-up start, Add Plant start). Guests too. */
analyticsRoutes.post('/', rateLimit({ name: 'events', max: 60, windowSeconds: 600 }), async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { name?: unknown; props?: unknown }
  const user = await userFromSession(c).catch(() => null)
  if (!(await analyticsService.fromClient(body.name, body.props, user?.id ?? null))) {
    throw Errors.invalid('Unknown event')
  }
  return c.body(null, 204)
})

/** Admin → System funnel card. */
analyticsRoutes.get('/funnel', async (c) => {
  await requireAdmin(c)
  return c.json(await analyticsService.funnel())
})
