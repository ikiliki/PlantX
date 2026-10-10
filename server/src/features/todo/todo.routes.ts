import { Hono } from 'hono'
import { requireUser } from '../../lib/session.ts'
import { activityService, visibleTo } from '../activity/activity.service.ts'
import { canSeePlant, loadVisibility } from '../../lib/visibility.ts'
import { greenhouseService } from '../greenhouse/greenhouse.service.ts'
import { isFirstWaterTodo, todoService } from './todo.service.ts'

export const todoRoutes = new Hono()

todoRoutes.get('/', async (c) => {
  const user = await requireUser(c)
  const open = c.req.query('open') === '1' || c.req.query('open') === 'true'
  const [rows, index] = await Promise.all([todoService.list({ ownerId: user.id, open: open || undefined }), loadVisibility()])
  // A deleted plant takes its tasks with it (they come back if an admin restores the plant).
  const todos = rows.filter((todo) => !todo.plantId || index.plant(todo.plantId) !== 'deleted')
  return c.json({ todos })
})

/** One plant's care, read-only: planned and done tasks for any member who may see that plant (its passport Tasks tab). */
todoRoutes.get('/plant/:plantId', async (c) => {
  const user = await requireUser(c)
  const plantId = c.req.param('plantId')
  const [plants, index] = await Promise.all([greenhouseService.list(), loadVisibility()])
  const plant = plants.find((item) => item.id === plantId)
  if (!plant || !canSeePlant(plant, index, user)) return c.json({ error: 'Plant not found' }, 404)
  return c.json({ todos: await todoService.list({ plantId }) })
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
  const activities = await visibleTo(await activityService.list(), user)
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
