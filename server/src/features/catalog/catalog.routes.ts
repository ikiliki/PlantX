import { Hono } from 'hono'
import type { Catalog } from '../../../../src/mock/types.ts'
import { getStore } from '../../db/index.ts'
import { requireAdmin, requireUser } from '../../lib/session.ts'
import { assertPhoto } from '../../lib/images.ts'
import { rateLimit } from '../../lib/rateLimit.ts'
import { catalogService } from './catalog.service.ts'
import { catalogSuggestionService } from './catalogSuggestion.service.ts'
import { todoService } from '../todo/todo.service.ts'

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

/** The signed-in member's open suggestions, shown as pending in their Catalog. */
catalogRoutes.get('/suggestions/mine', async (c) => {
  const user = await requireUser(c)
  return c.json({ suggestions: await catalogSuggestionService.mine(user.id) })
})

/** A member's "Suggest a plant" form. */
catalogRoutes.post('/suggestions', rateLimit({ name: 'suggest', max: 10, windowSeconds: 3600 }), async (c) => {
  const user = await requireUser(c)
  const body = await c.req.json().catch(() => ({}))
  const photo = (body as { photo?: unknown }).photo
  if (typeof photo === 'string' && photo) assertPhoto(photo)
  return c.json({ suggestion: await catalogSuggestionService.suggestFromMember(user.id, body) })
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

/** Care plans → Suggest with AI: Gemini proposes one category's care rules (admin only, never automatic). */
catalogRoutes.post('/care/suggest/:categoryId', rateLimit({ name: 'care-suggest', max: 30, windowSeconds: 3600 }), async (c) => {
  await requireAdmin(c)
  const catalog = await catalogService.suggestCare(c.req.param('categoryId'))
  // Plants follow the new care: due days move, tasks that no longer apply drop, new ones open.
  await todoService.ensureCareTodos({ move: true })
  return c.json({ catalog })
})

/** Accepts `{ catalog }` or a raw catalog object. */
catalogRoutes.put('/', async (c) => {
  await requireAdmin(c)
  const body = (await c.req.json()) as Catalog | { catalog: Catalog }
  const catalog = 'catalog' in body && body.catalog ? body.catalog : (body as Catalog)
  const saved = await catalogService.save(catalog)
  await todoService.ensureCareTodos({ move: true })
  return c.json({ catalog: saved })
})
