import { Hono } from 'hono'
import { requireAdmin } from '../../lib/session.ts'
import { usersService } from './users.service.ts'

export const usersRoutes = new Hono()

/** Public: landing / auth register → pending queue. */
usersRoutes.post('/pending', async (c) => {
  const body = (await c.req.json()) as { name?: string; email?: string; note?: string }
  const pending = await usersService.requestAccess({
    name: body.name ?? '',
    email: body.email ?? '',
    note: body.note,
  })
  return c.json({ pending }, 201)
})

usersRoutes.get('/pending', async (c) => {
  await requireAdmin(c)
  const raw = c.req.query('status')
  const status =
    raw === 'all' || raw === 'approved' || raw === 'rejected' || raw === 'pending' ? raw : 'pending'
  return c.json({ pending: await usersService.listPending(status) })
})

usersRoutes.get('/pending/:id', async (c) => {
  await requireAdmin(c)
  return c.json({ pending: await usersService.getPending(c.req.param('id')) })
})

usersRoutes.post('/pending/:id/approve', async (c) => {
  await requireAdmin(c)
  const result = await usersService.approve(c.req.param('id'))
  return c.json(result)
})

usersRoutes.post('/pending/:id/reject', async (c) => {
  await requireAdmin(c)
  return c.json({ pending: await usersService.reject(c.req.param('id')) })
})

usersRoutes.get('/', async (c) => {
  await requireAdmin(c)
  return c.json({ users: await usersService.listMembers() })
})

usersRoutes.get('/transactions/pending', async (c) => {
  await requireAdmin(c)
  return c.json({ transactions: await usersService.listPendingTransactions() })
})

usersRoutes.post('/:id/disable', async (c) => {
  await requireAdmin(c)
  return c.json({ user: await usersService.setAccountStatus(c.req.param('id'), 'disabled') })
})

usersRoutes.post('/:id/enable', async (c) => {
  await requireAdmin(c)
  return c.json({ user: await usersService.setAccountStatus(c.req.param('id'), 'active') })
})

usersRoutes.post('/:id/preapproved', async (c) => {
  await requireAdmin(c)
  const body = (await c.req.json().catch(() => ({}))) as { preapproved?: boolean }
  return c.json({ user: await usersService.setPreapproved(c.req.param('id'), Boolean(body.preapproved)) })
})
