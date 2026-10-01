import { Hono } from 'hono'
import type { Catalog } from '../../../../src/mock/types.ts'
import { getStore } from '../../db/index.ts'
import { requireAdmin } from '../../lib/session.ts'
import { catalogService } from './catalog.service.ts'

export const catalogRoutes = new Hono()

catalogRoutes.get('/', async (c) => c.json({ catalog: await catalogService.get() }))

catalogRoutes.get('/suggestions', async (c) => {
  await requireAdmin(c)
  const raw = c.req.query('status')
  const status =
    raw === 'all' || raw === 'open' || raw === 'dismissed' || raw === 'added' ? raw : 'open'
  const suggestions = await getStore().catalogSuggestions.list(status)
  return c.json({ suggestions })
})

catalogRoutes.post('/suggestions/:id/dismiss', async (c) => {
  await requireAdmin(c)
  await getStore().catalogSuggestions.dismiss(c.req.param('id'))
  return c.json({ ok: true })
})

catalogRoutes.post('/suggestions/:id/accept', async (c) => {
  await requireAdmin(c)
  await getStore().catalogSuggestions.accept(c.req.param('id'))
  return c.json({ ok: true })
})

/** Accepts `{ catalog }` or a raw catalog object. */
catalogRoutes.put('/', async (c) => {
  await requireAdmin(c)
  const body = (await c.req.json()) as Catalog | { catalog: Catalog }
  const catalog = 'catalog' in body && body.catalog ? body.catalog : (body as Catalog)
  return c.json({ catalog: await catalogService.save(catalog) })
})
