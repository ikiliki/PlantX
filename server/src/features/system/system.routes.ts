import { Hono } from 'hono'
import type { SystemConfig } from '../../../../src/theme/release.ts'
import { requireAdmin } from '../../lib/session.ts'
import { systemService } from './system.service.ts'

export const systemRoutes = new Hono()

systemRoutes.put('/', async (c) => {
  requireAdmin(c)
  const body = (await c.req.json()) as Partial<SystemConfig>
  const system = await systemService.save(body)
  return c.json({ system })
})
