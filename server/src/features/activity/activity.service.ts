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
    if (!input?.kind || !input.userId || !input.body || !input.bodyHe) {
      throw Errors.invalid('Activity kind, userId, body, and bodyHe are required')
    }
    const activity: Activity = {
      id: input.id ?? `act-${Date.now()}`,
      kind: input.kind,
      userId: input.userId,
      plantId: input.plantId,
      body: input.body,
      bodyHe: input.bodyHe,
      createdAt: input.createdAt ?? new Date().toISOString(),
    }
    const rows = await getStore().activities.list()
    rows.unshift(activity)
    await getStore().activities.saveAll(rows)
    return activity
  },
}
