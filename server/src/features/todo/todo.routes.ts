import { Hono } from 'hono'
import { requireUser } from '../../lib/session.ts'
import { activityService } from '../activity/activity.service.ts'
import { isFirstWaterTodo, todoService } from './todo.service.ts'

export const todoRoutes = new Hono()

todoRoutes.get('/', async (c) => {
  const user = await requireUser(c)
  const open = c.req.query('open') === '1' || c.req.query('open') === 'true'
  const todos = await todoService.list({ ownerId: user.id, open: open || undefined })
  return c.json({ todos })
})

todoRoutes.get('/:id', async (c) => {
  const user = await requireUser(c)
  const todo = await todoService.get(c.req.param('id'))
  if (todo.ownerId !== user.id) return c.json({ error: 'Forbidden' }, 403)
  const rows = await todoService.list({ ownerId: user.id })
  return c.json({ todo, firstWater: isFirstWaterTodo(todo, rows) })
})

todoRoutes.post('/:id/complete', async (c) => {
  const user = await requireUser(c)
  const body = (await c.req.json().catch(() => ({}))) as { completedOn?: unknown }
  const completedOn = typeof body.completedOn === 'string' ? body.completedOn : undefined
  const result = await todoService.complete(c.req.param('id'), user.id, completedOn)
  const activities = await activityService.list()
  return c.json({
    todo: result.todo,
    todos: result.todos,
    plant: result.plant,
    activity: result.activity,
    update: result.activity,
    updates: activities,
    activities,
  })
})
