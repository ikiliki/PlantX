import { Hono } from 'hono'
import type { Plant } from '../../../../src/mock/types.ts'
import { requireUser } from '../../lib/session.ts'
import { activityService } from '../activity/activity.service.ts'
import { todoService } from '../todo/todo.service.ts'
import { greenhouseService } from './greenhouse.service.ts'

export const greenhouseRoutes = new Hono()

greenhouseRoutes.get('/', async (c) => c.json({ plants: await greenhouseService.list() }))

greenhouseRoutes.get('/:id', async (c) => {
  const plant = await greenhouseService.get(c.req.param('id'))
  return c.json({ plant })
})

/** Plant card / passport: plant from greenhouse, timeline from activity. */
greenhouseRoutes.get('/:id/activities', async (c) => {
  const plant = await greenhouseService.get(c.req.param('id'))
  return c.json({
    plantId: plant.id,
    activities: await activityService.listForPlant(plant.id),
  })
})

greenhouseRoutes.post('/', async (c) => {
  const user = await requireUser(c)
  const { identifyRequestIds, identifyRequestId, ...plant } = (await c.req.json()) as Plant & {
    identifyRequestIds?: unknown
    identifyRequestId?: unknown
  }
  const ids = Array.isArray(identifyRequestIds) ? identifyRequestIds : [identifyRequestId]
  const created = await greenhouseService.add(
    plant,
    user.id,
    ids.map((id) => (typeof id === 'string' && id ? id : undefined)),
  )
  const [activities, todos] = await Promise.all([
    activityService.list(),
    todoService.list({ ownerId: user.id }),
  ])
  return c.json({
    plant: created,
    /** Client still expects `updates` on live merges. */
    updates: activities,
    activities,
    todos,
  })
})
