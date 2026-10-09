import { Hono } from 'hono'
import { signedIn, type SignedInEnv } from '../../lib/session.ts'
import { shelvesService } from './shelves.service.ts'

/** `/api/shelves`: the signed-in grower's own shelves only. */
export const shelvesRoutes = new Hono<SignedInEnv>()

shelvesRoutes.use('*', signedIn)

shelvesRoutes.get('/', async (c) => c.json(await shelvesService.mine(c.get('user').id)))

shelvesRoutes.post('/', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { name?: unknown }
  return c.json({ shelf: await shelvesService.add(c.get('user').id, body.name) }, 201)
})

shelvesRoutes.patch('/:id', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { name?: unknown; position?: unknown }
  return c.json({ shelves: await shelvesService.update(c.get('user').id, c.req.param('id'), body) })
})

shelvesRoutes.delete('/:id', async (c) => {
  await shelvesService.remove(c.get('user').id, c.req.param('id'))
  return c.json({ ok: true })
})
