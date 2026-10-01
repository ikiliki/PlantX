import { Hono } from 'hono'
import { userFromSession } from '../../lib/session.ts'
import { liveService } from './live.service.ts'

export const liveRoutes = new Hono()

liveRoutes.get('/', async (c) => {
  const user = await userFromSession(c)
  return c.json(await liveService.payload(user?.id ?? null))
})
