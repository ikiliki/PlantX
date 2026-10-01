import { Hono } from 'hono'
import type { Plant } from '../../../../src/mock/types.ts'
import { requireUser } from '../../lib/session.ts'
import { activityService } from '../activity/activity.service.ts'
import { greenhouseService } from './greenhouse.service.ts'

export const greenhouseRoutes = new Hono()

greenhouseRoutes.get('/', (c) => c.json({ plants: greenhouseService.list() }))

greenhouseRoutes.get('/:id', (c) => {
  const plant = greenhouseService.get(c.req.param('id'))
  return c.json({ plant })
})

/** Plant card / passport: plant from greenhouse, timeline from activity. */
greenhouseRoutes.get('/:id/activities', (c) => {
  const plant = greenhouseService.get(c.req.param('id'))
  return c.json({
    plantId: plant.id,
    activities: activityService.listForPlant(plant.id),
  })
})

greenhouseRoutes.post('/', async (c) => {
  const user = requireUser(c)
  const plant = (await c.req.json()) as Plant
  const created = greenhouseService.add(plant, user.id)
  const activities = activityService.list()
  return c.json({
    plant: created,
    /** Client still expects `updates` on live merges. */
    updates: activities,
    activities,
  })
})

greenhouseRoutes.post('/:id/water', (c) => {
  const user = requireUser(c)
  const result = greenhouseService.water(c.req.param('id'), user.id)
  const activities = activityService.list()
  return c.json({
    plant: result.plant,
    update: result.activity,
    activity: result.activity,
    updates: activities,
    activities,
  })
})

greenhouseRoutes.post('/:id/photo', (c) => {
  const user = requireUser(c)
  const result = greenhouseService.refreshPhoto(c.req.param('id'), user.id)
  const activities = activityService.list()
  return c.json({
    plant: result.plant,
    update: result.activity,
    activity: result.activity,
    updates: activities,
    activities,
  })
})
