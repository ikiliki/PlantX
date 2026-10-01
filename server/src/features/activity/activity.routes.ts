import { Hono } from 'hono'
import { activityService } from './activity.service.ts'
import type { ActivityInput } from './activity.types.ts'

/**
 * Activity HTTP surface.
 * Later an event service will call `activityService.record` instead of (or before) these writes.
 */
export const activityRoutes = new Hono()

activityRoutes.get('/', async (c) => {
  const plantId = c.req.query('plantId') || undefined
  const userId = c.req.query('userId') || undefined
  const limitRaw = c.req.query('limit')
  const limit = limitRaw != null && limitRaw !== '' ? Number(limitRaw) : undefined
  const activities = await activityService.list({
    plantId,
    userId,
    limit: Number.isFinite(limit) ? limit : undefined,
  })
  return c.json({ activities })
})

/** Generic write — what the future event bus will hit. Prefer plant care routes for water/photo. */
activityRoutes.post('/', async (c) => {
  const body = (await c.req.json()) as ActivityInput
  const activity = await activityService.record(body)
  return c.json({ activity, activities: await activityService.list() })
})
