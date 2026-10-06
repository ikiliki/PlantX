import { Hono } from 'hono'
import type { SystemConfig } from '../../../../src/theme/release.ts'
import { requireAdmin } from '../../lib/session.ts'
import { healthService } from '../health/health.service.ts'
import { systemService } from './system.service.ts'

export const systemRoutes = new Hono()

/** Admin → System health (#56): API, database round trip, migrations, identify keys, error counts. */
systemRoutes.get('/health', async (c) => {
  await requireAdmin(c)
  return c.json({ health: await healthService.system() })
})

systemRoutes.put('/', async (c) => {
  await requireAdmin(c)
  const body = (await c.req.json()) as Partial<SystemConfig>
  const system = await systemService.save(body)
  return c.json({ system })
})
