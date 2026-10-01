import { getStore } from '../../db/index.ts'
import { Errors } from '../../lib/errors.ts'
import type { Activity, ActivityInput, ActivityQuery } from './activity.types.ts'

function newestFirst(a: Activity, b: Activity) {
  return b.createdAt.localeCompare(a.createdAt)
}

/**
 * Generic activity log. UI actions (and later an event bus) call `record`.
 * Home feed and plant cards call `list` / `listForPlant`.
 */
export const activityService = {
  async list(query: ActivityQuery = {}): Promise<Activity[]> {
    let rows = (await getStore().activities.list()).slice().sort(newestFirst)
    if (query.plantId) rows = rows.filter((row) => row.plantId === query.plantId)
    if (query.userId) rows = rows.filter((row) => row.userId === query.userId)
    if (query.limit != null && query.limit >= 0) rows = rows.slice(0, query.limit)
    return rows
  },

  async listForPlant(plantId: string): Promise<Activity[]> {
    return activityService.list({ plantId })
  },

  async record(input: ActivityInput): Promise<Activity> {
    const activity = activityFrom(input)
    const rows = await getStore().activities.list()
    rows.unshift(activity)
    await getStore().activities.saveAll(rows)
    return activity
  },

  /** A plant was added: its earlier `scan` rows now point at it, then the `added` row is recorded. */
  async recordAdded(input: ActivityInput, scanRequestIds: string[]): Promise<Activity> {
    const activity = activityFrom(input)
    const linked = new Set(scanRequestIds)
    const rows = await getStore().activities.list()
    for (const row of rows) {
      if (row.kind === 'scan' && row.userId === input.userId && row.identifyRequestId && linked.has(row.identifyRequestId)) {
        row.plantId = input.plantId
      }
    }
    rows.unshift(activity)
    await getStore().activities.saveAll(rows)
    return activity
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
