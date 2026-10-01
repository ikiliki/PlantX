import { Errors } from '../../lib/errors.ts'
import { fileExists, readJson, writeJson } from '../../lib/jsonStore.ts'
import type { Activity, ActivityInput, ActivityQuery } from './activity.types.ts'

const FILE = 'activities.json'
const LEGACY = 'updates.json'

function loadAll(): Activity[] {
  if (fileExists(FILE)) return readJson<Activity[]>(FILE, [])
  if (fileExists(LEGACY)) {
    const legacy = readJson<Activity[]>(LEGACY, [])
    writeJson(FILE, legacy)
    return legacy
  }
  return []
}

function saveAll(rows: Activity[]) {
  writeJson(FILE, rows)
}

function newestFirst(a: Activity, b: Activity) {
  return b.createdAt.localeCompare(a.createdAt)
}

/**
 * Generic activity log. UI actions (and later an event bus) call `record`.
 * Home feed and plant cards call `list` / `listForPlant`.
 */
export const activityService = {
  list(query: ActivityQuery = {}): Activity[] {
    let rows = loadAll().slice().sort(newestFirst)
    if (query.plantId) rows = rows.filter((row) => row.plantId === query.plantId)
    if (query.userId) rows = rows.filter((row) => row.userId === query.userId)
    if (query.limit != null && query.limit >= 0) rows = rows.slice(0, query.limit)
    return rows
  },

  listForPlant(plantId: string): Activity[] {
    return activityService.list({ plantId })
  },

  record(input: ActivityInput): Activity {
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
    const rows = loadAll()
    rows.unshift(activity)
    saveAll(rows)
    return activity
  },
}
