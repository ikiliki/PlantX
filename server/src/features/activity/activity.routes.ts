import { Hono } from 'hono'
import { getStore } from '../../db/index.ts'
import { Errors } from '../../lib/errors.ts'
import { activityService } from './activity.service.ts'
import type { Activity, ActivityInput, ActivityKind } from './activity.types.ts'

/**
 * Activity HTTP surface.
 * Lists are the basic row. `GET /id/:id` is the one place that adds the linked identify request.
 */
export const activityRoutes = new Hono()

const KINDS: ActivityKind[] = ['photo', 'water', 'propagate', 'grade', 'passport', 'listing', 'scan', 'added']

function isKind(value: string): value is ActivityKind {
  return (KINDS as string[]).includes(value)
}

function readLimit(raw: string | undefined) {
  if (raw == null || raw === '') return undefined
  const limit = Number(raw)
  return Number.isFinite(limit) ? limit : undefined
}

activityRoutes.get('/', async (c) => {
  const activities = await activityService.list({
    plantId: c.req.query('plantId') || undefined,
    userId: c.req.query('userId') || undefined,
    limit: readLimit(c.req.query('limit')),
  })
  return c.json({ activities })
})

/** Every kind for one person. */
activityRoutes.get('/user/:userId', async (c) => {
  const activities = await activityService.list({
    userId: c.req.param('userId'),
    limit: readLimit(c.req.query('limit')),
  })
  return c.json({ activities })
})

/** One activity, plus the identify request when this row has one. */
activityRoutes.get('/id/:id', async (c) => {
  const activity = await activityService.get(c.req.param('id'))
  if (!activity) throw Errors.missing('Activity not found')
  return c.json({ activity, detail: await detailFor(activity) })
})

/** One kind, optionally one person: `/api/activities/scan` or `/api/activities/scan/u-admin`. */
activityRoutes.get('/:type/:userId', async (c) => {
  const type = c.req.param('type')
  if (!isKind(type)) throw Errors.invalid(`type must be one of ${KINDS.join(', ')}`)
  const activities = await activityService.list({
    kind: type,
    userId: c.req.param('userId'),
    limit: readLimit(c.req.query('limit')),
  })
  return c.json({ activities })
})

activityRoutes.get('/:type', async (c) => {
  const type = c.req.param('type')
  if (!isKind(type)) throw Errors.invalid(`type must be one of ${KINDS.join(', ')}`)
  const activities = await activityService.list({
    kind: type,
    userId: c.req.query('userId') || undefined,
    limit: readLimit(c.req.query('limit')),
  })
  return c.json({ activities })
})

/** Generic write — what the future event bus will hit. Prefer plant care routes for water/photo. */
activityRoutes.post('/', async (c) => {
  const body = (await c.req.json()) as ActivityInput
  if (body?.kind === 'scan' || body?.kind === 'added' || body?.identifyRequestId) {
    throw Errors.invalid('scan and added activities are recorded by identify and Add Plant only')
  }
  const activity = await activityService.record(body)
  return c.json({ activity, activities: await activityService.list() })
})

/** Linked identify request, without the photo thumb. Absent when the row has none. */
async function detailFor(activity: Activity) {
  if (!activity.identifyRequestId) return null
  const record = await getStore().identifyRequests.get(activity.identifyRequestId)
  if (!record) return null
  const { thumb: _thumb, ...detail } = record
  return detail
}
