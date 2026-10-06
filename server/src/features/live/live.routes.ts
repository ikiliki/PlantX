import { analyticsService } from '../analytics/analytics.service.ts'
import { Hono } from 'hono'
import { userFromSession } from '../../lib/session.ts'
import { liveService } from './live.service.ts'

export const liveRoutes = new Hono()

liveRoutes.get('/', async (c) => {
  const user = await userFromSession(c)
  if (user) await analyticsService.visit(user.id)
  return c.json(await liveService.payload(user?.id ?? null))
})
