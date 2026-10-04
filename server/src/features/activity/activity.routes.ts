import { Hono } from 'hono'
import { canSeeActivity } from '../../../../src/features/feed/activityXp.ts'
import { getStore } from '../../db/index.ts'
import { Errors } from '../../lib/errors.ts'
import { signedIn, type SignedInEnv } from '../../lib/session.ts'
import { greenhouseService } from '../greenhouse/greenhouse.service.ts'
import { activityService, visibleTo } from './activity.service.ts'
import type { Activity, ActivityInput, ActivityKind } from './activity.types.ts'

/**
 * Activity HTTP surface, members only.
 * Lists are the basic row. `GET /id/:id` is the one place that adds the linked identify request.
 * Only XP activities (added, water, photo) are public; other kinds reach their owner and admins only.
 */
export const activityRoutes = new Hono<SignedInEnv>()

activityRoutes.use('*', signedIn)

const KINDS: ActivityKind[] = ['photo', 'water', 'propagate', 'grade', 'passport', 'listing', 'scan', 'added']

function isKind(value: unknown): value is ActivityKind {
  return typeof value === 'string' && (KINDS as string[]).includes(value)
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
  return c.json({ activities: visibleTo(activities, c.get('user')) })
})

/** Every kind for one person. */
activityRoutes.get('/user/:userId', async (c) => {
  const activities = await activityService.list({
    userId: c.req.param('userId'),
    limit: readLimit(c.req.query('limit')),
  })
  return c.json({ activities: visibleTo(activities, c.get('user')) })
})

/** One activity, plus the identify request when this row has one. */
activityRoutes.get('/id/:id', async (c) => {
  const activity = await activityService.get(c.req.param('id'))
  if (!activity || !canSeeActivity(activity, c.get('user'))) throw Errors.missing('Activity not found')
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
  return c.json({ activities: visibleTo(activities, c.get('user')) })
})

activityRoutes.get('/:type', async (c) => {
  const type = c.req.param('type')
  if (!isKind(type)) throw Errors.invalid(`type must be one of ${KINDS.join(', ')}`)
  const activities = await activityService.list({
    kind: type,
    userId: c.req.query('userId') || undefined,
    limit: readLimit(c.req.query('limit')),
  })
  return c.json({ activities: visibleTo(activities, c.get('user')) })
})

/**
 * Generic write — what the future event bus will hit. Prefer plant care routes for water/photo.
 * Always as the signed-in user, on their own plant; id and time are the server's.
 */
activityRoutes.post('/', async (c) => {
  const user = c.get('user')
  const body = (await c.req.json()) as ActivityInput
  if (body?.kind === 'scan' || body?.kind === 'added' || body?.identifyRequestId) {
    throw Errors.invalid('scan and added activities are recorded by identify and Add Plant only')
  }
  if (!isKind(body?.kind)) throw Errors.invalid(`kind must be one of ${KINDS.join(', ')}`)
  if (body.plantId) {
    const plant = await greenhouseService.get(body.plantId)
    if (plant.ownerId !== user.id) throw Errors.forbidden('Plant is not yours')
  }
  const activity = await activityService.record({
    kind: body.kind,
    userId: user.id,
    plantId: body.plantId,
    body: body.body,
    bodyHe: body.bodyHe,
  })
  return c.json({ activity, activities: visibleTo(await activityService.list(), user) })
})

/** Linked identify request, without the photo thumb. Absent when the row has none. */
async function detailFor(activity: Activity) {
  if (!activity.identifyRequestId) return null
  const record = await getStore().identifyRequests.get(activity.identifyRequestId)
  if (!record) return null
  const { thumb: _thumb, ...detail } = record
  return detail
}
