import { Hono } from 'hono'
import { userFromSession } from '../../lib/session.ts'
import { liveService } from './live.service.ts'

export const liveRoutes = new Hono()

liveRoutes.get('/', (c) => {
  const user = userFromSession(c)
  return c.json(liveService.payload(user?.id ?? null))
})
