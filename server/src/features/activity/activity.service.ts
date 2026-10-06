import { canSeeActivity } from '../../../../src/features/feed/activityXp.ts'
import { addedActivityText, scanActivityText } from '../../../../src/features/greenhouse/identification.ts'
import { getStore } from '../../db/index.ts'
import { Errors } from '../../lib/errors.ts'
import { notifyActivity } from '../../lib/events.ts'
import { logger } from '../../lib/logger.ts'
import { loadVisibility, visibleActivities } from '../../lib/visibility.ts'
import type { User } from '../../../../src/mock/types.ts'
import type { Activity, ActivityInput, ActivityQuery } from './activity.types.ts'

function newestFirst(a: Activity, b: Activity) {
  return b.createdAt.localeCompare(a.createdAt)
}

/**
 * Generic activity log. UI actions (and later an event bus) call `record`.
 * Home feed and plant cards call `list` / `listForPlant`.
 */
/**
 * What this viewer may read: XP activities for everyone, the rest for their owner and admins — and
 * nothing an admin hid, directly or through its plant or grower (lib/visibility.ts).
 */
export async function visibleTo(activities: Activity[], viewer: Pick<User, 'id' | 'role'> | null | undefined) {
  const index = await loadVisibility()
  return visibleActivities(
    activities.filter((activity) => canSeeActivity(activity, viewer)),
    index,
    viewer,
  )
}

export const activityService = {
  async list(query: ActivityQuery = {}): Promise<Activity[]> {
    let rows = (await getStore().activities.list()).slice().sort(newestFirst)
    if (query.kind) rows = rows.filter((row) => row.kind === query.kind)
    if (query.plantId) rows = rows.filter((row) => row.plantId === query.plantId)
    if (query.userId) rows = rows.filter((row) => row.userId === query.userId)
    if (query.limit != null && query.limit >= 0) rows = rows.slice(0, query.limit)
    return rows
  },

  async listForPlant(plantId: string): Promise<Activity[]> {
    return activityService.list({ plantId })
  },

  async get(id: string): Promise<Activity | undefined> {
    const rows = await getStore().activities.list()
    return rows.find((row) => row.id === id)
  },

  async record(input: ActivityInput): Promise<Activity> {
    const activity = activityFrom(input)
    await getStore().activities.upsert([activity])
    await notifyActivity(activity)
    return activity
  },

  /** A plant was added: its earlier `scan` rows now point at it, then the `added` row is recorded. */
  async recordAdded(input: ActivityInput, scanRequestIds: string[]): Promise<Activity> {
    const activity = activityFrom(input)
    const linked = new Set(scanRequestIds)
    const rows = await getStore().activities.list()
    const scans = rows.filter(
      (row) => row.kind === 'scan' && row.userId === input.userId && row.identifyRequestId && linked.has(row.identifyRequestId),
    )
    for (const row of scans) row.plantId = input.plantId
    await getStore().activities.upsert([activity, ...scans])
    await notifyActivity(activity)
    return activity
  },

  /**
   * Every identify request has a `scan` row, and every plant has an `added` row.
   * Those writes used to be dropped when the activities kind check rejected them.
   */
  async ensureMains(): Promise<void> {
    const store = getStore()
    const [activities, plants, requests] = await Promise.all([
      store.activities.list(),
      store.plants.list(),
      store.identifyRequests.list({ limit: 500 }),
    ])
    const added: Activity[] = []
    for (const request of requests) {
      if (activities.some((row) => row.kind === 'scan' && row.identifyRequestId === request.id)) continue
      added.unshift({
        id: `act-scan-${request.id}`,
        kind: 'scan',
        userId: request.userId,
        plantId: request.plantId,
        identifyRequestId: request.id,
        createdAt: request.createdAt,
        ...scanActivityText(request.diagnosis),
      })
    }
    for (const plant of plants) {
      if (activities.some((row) => row.kind === 'added' && row.plantId === plant.id)) continue
      const identification = plant.identification ?? { source: 'manual' as const, at: plant.createdAt }
      added.unshift({
        id: `act-added-${plant.id}`,
        kind: 'added',
        userId: plant.ownerId,
        plantId: plant.id,
        identifyRequestId: identification.requestId,
        createdAt: plant.createdAt,
        ...addedActivityText(plant.title, plant.titleHe, identification),
      })
    }
    if (added.length === 0) return
    await store.activities.upsert(added)
    logger.info(`Backfilled ${added.length} activity rows from identify requests and plants`)
  },
}

function activityFrom(input: ActivityInput): Activity {
  if (!input?.kind || !input.userId || !input.body || !input.bodyHe) {
    throw Errors.invalid('Activity kind, userId, body, and bodyHe are required')
  }
  const activity: Activity = {
    id: input.id ?? `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    kind: input.kind,
    userId: input.userId,
    plantId: input.plantId,
    body: input.body,
    bodyHe: input.bodyHe,
    createdAt: input.createdAt ?? new Date().toISOString(),
  }
  if (input.identifyRequestId) activity.identifyRequestId = input.identifyRequestId
  return activity
}
