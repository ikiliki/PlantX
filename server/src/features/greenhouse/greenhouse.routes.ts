import { Hono } from 'hono'
import type { Plant } from '../../../../src/mock/types.ts'
import { requireUser } from '../../lib/session.ts'
import { activityService } from '../activity/activity.service.ts'
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
  const plant = (await c.req.json()) as Plant
  const created = await greenhouseService.add(plant, user.id)
  const activities = await activityService.list()
  return c.json({
    plant: created,
    /** Client still expects `updates` on live merges. */
    updates: activities,
    activities,
  })
})

greenhouseRoutes.post('/:id/water', async (c) => {
  const user = await requireUser(c)
  const result = await greenhouseService.water(c.req.param('id'), user.id)
  const activities = await activityService.list()
  return c.json({
    plant: result.plant,
    update: result.activity,
    activity: result.activity,
    updates: activities,
    activities,
  })
})

greenhouseRoutes.post('/:id/photo', async (c) => {
  const user = await requireUser(c)
  const result = await greenhouseService.refreshPhoto(c.req.param('id'), user.id)
  const activities = await activityService.list()
  return c.json({
    plant: result.plant,
    update: result.activity,
    activity: result.activity,
    updates: activities,
    activities,
  })
})
