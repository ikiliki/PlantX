import { Hono } from 'hono'
import type { Catalog } from '../../../../src/mock/types.ts'
import { requireAdmin } from '../../lib/session.ts'
import { catalogService } from './catalog.service.ts'

export const catalogRoutes = new Hono()

catalogRoutes.get('/', (c) => c.json({ catalog: catalogService.get() }))

/** Accepts `{ catalog }` or a raw catalog object. */
catalogRoutes.put('/', async (c) => {
  requireAdmin(c)
  const body = (await c.req.json()) as Catalog | { catalog: Catalog }
  const catalog = 'catalog' in body && body.catalog ? body.catalog : (body as Catalog)
  return c.json({ catalog: catalogService.save(catalog) })
})
