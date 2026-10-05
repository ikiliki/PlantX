import type {
  ModerationAction,
  ModerationEntry,
  ModerationImpact,
  ModerationTarget,
  Plant,
  User,
  Visibility,
} from '../../../../src/mock/types.ts'
import { getStore } from '../../db/index.ts'
import { Errors } from '../../lib/errors.ts'
import { stateOf, visibilityIndex } from '../../lib/visibility.ts'
import type { Activity } from '../activity/activity.types.ts'

/**
 * Admin moderation (#68, #69). Hide / show / soft delete / restore one user, plant or activity.
 * Only that row's visibility changes; its children follow through the computed cascade
 * (lib/visibility.ts), and the impact counts say what that reaches. Every action is logged.
 */
const NEXT: Record<Exclude<ModerationAction, 'edit'>, Visibility> = {
  hide: 'hidden',
  show: 'visible',
  delete: 'deleted',
  restore: 'visible',
}

export type ModerationItem = {
  type: ModerationTarget
  id: string
  label: string
  /** Grower (plant, activity) or email (user). */
  detail: string
  ownerId: string
  /** The row's own state. */
  visibility: Visibility
  /** What viewers get, including a hidden parent. */
  effective: Visibility
  changedAt?: string
  changedBy?: string
  reason?: string
  createdAt?: string
}

function userLabel(user: User | undefined) {
  if (!user) return '—'
  return user.nickname?.trim() || user.name
}

async function world() {
  const store = getStore()
  const [users, plants, activities, todos] = await Promise.all([
    store.users.list(),
    store.plants.list(),
    store.activities.list(),
    store.todos.list(),
  ])
  return { users, plants, activities, todos }
}

type World = Awaited<ReturnType<typeof world>>

function find(w: World, type: ModerationTarget, id: string): User | Plant | Activity {
  const row =
    type === 'user'
      ? w.users.find((item) => item.id === id && item.role !== 'guest')
      : type === 'plant'
        ? w.plants.find((item) => item.id === id)
        : w.activities.find((item) => item.id === id)
  if (!row) throw Errors.missing(`${type} ${id} not found`)
  return row
}

/** Children that are visible on their own today and would go out of view with the parent. */
function impactOf(w: World, type: ModerationTarget, id: string): ModerationImpact {
  const shown = (row: { visibility?: Visibility }) => stateOf(row) === 'visible'
  if (type === 'user') {
    const plants = w.plants.filter((plant) => plant.ownerId === id && shown(plant))
    const plantIds = new Set(w.plants.filter((plant) => plant.ownerId === id).map((plant) => plant.id))
    return {
      plants: plants.length,
      activities: w.activities.filter((item) => (item.userId === id || (item.plantId && plantIds.has(item.plantId))) && shown(item)).length,
      todos: w.todos.filter((todo) => todo.ownerId === id).length,
    }
  }
  if (type === 'plant') {
    return {
      plants: 0,
      activities: w.activities.filter((item) => item.plantId === id && shown(item)).length,
      todos: w.todos.filter((todo) => todo.plantId === id).length,
    }
  }
  return { plants: 0, activities: 0, todos: 0 }
}

function labelOf(w: World, type: ModerationTarget, row: User | Plant | Activity) {
  if (type === 'user') return userLabel(row as User)
  if (type === 'plant') return (row as Plant).title
  const activity = row as Activity
  return activity.body.slice(0, 80)
}

export const moderationService = {
  async impact(type: ModerationTarget, id: string) {
    const w = await world()
    const row = find(w, type, id)
    return { label: labelOf(w, type, row), visibility: stateOf(row), impact: impactOf(w, type, id) }
  },

  async apply(type: ModerationTarget, id: string, action: ModerationAction, reason: string, admin: User) {
    if (action === 'edit') throw Errors.invalid('Use the edit routes to change fields')
    const w = await world()
    const row = find(w, type, id)
    if (type === 'user' && ((row as User).role === 'admin' || id === admin.id)) {
      throw Errors.forbidden('The admin account cannot be hidden or deleted')
    }
    const visibility = NEXT[action]
    const impact = impactOf(w, type, id)
    const store = getStore()
    await store.moderation.setVisibility(type, id, { visibility, by: admin.id, reason: reason.trim().slice(0, 300) })
    const entry: ModerationEntry = {
      id: `mod-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      actorId: admin.id,
      actorName: admin.name,
      targetType: type,
      targetId: id,
      targetLabel: labelOf(w, type, row),
      action,
      reason: reason.trim().slice(0, 300),
      cascade: impact,
      createdAt: new Date().toISOString(),
    }
    await store.moderation.log(entry)
    return { entry, impact, visibility }
  },

  /** Admin edits to someone else's row are logged too. */
  async logEdit(type: ModerationTarget, id: string, label: string, admin: User, fields: string[]) {
    await getStore().moderation.log({
      id: `mod-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      actorId: admin.id,
      targetType: type,
      targetId: id,
      targetLabel: label,
      action: 'edit',
      reason: fields.join(', '),
      cascade: {},
      createdAt: new Date().toISOString(),
    })
  },

  /** Admin → Moderation list: one type, filtered by state and a search, newest first. */
  async items(type: ModerationTarget, state: Visibility | 'all' | 'moderated', query: string, limit = 200) {
    const w = await world()
    const index = visibilityIndex(w.users, w.plants)
    const users = new Map(w.users.map((user) => [user.id, user]))
    const plants = new Map(w.plants.map((plant) => [plant.id, plant]))
    let rows: ModerationItem[]
    if (type === 'user') {
      rows = w.users
        .filter((user) => user.role !== 'guest')
        .map((user) => ({
          type,
          id: user.id,
          label: userLabel(user),
          detail: user.email ?? '',
          ownerId: user.id,
          visibility: stateOf(user),
          effective: index.user(user.id),
          changedAt: user.visibilityChangedAt,
          changedBy: userLabel(users.get(user.visibilityChangedBy ?? '')),
          reason: user.visibilityReason,
        }))
    } else if (type === 'plant') {
      rows = w.plants.map((plant) => ({
        type,
        id: plant.id,
        label: plant.title,
        detail: userLabel(users.get(plant.ownerId)),
        ownerId: plant.ownerId,
        visibility: stateOf(plant),
        effective: index.plant(plant.id),
        changedAt: plant.visibilityChangedAt,
        changedBy: plant.visibilityChangedBy ? userLabel(users.get(plant.visibilityChangedBy)) : undefined,
        reason: plant.visibilityReason,
        createdAt: plant.createdAt,
      }))
    } else {
      rows = w.activities
        .slice()
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((item) => ({
          type,
          id: item.id,
          label: item.body,
          detail: [userLabel(users.get(item.userId)), item.plantId ? plants.get(item.plantId)?.title : '']
            .filter(Boolean)
            .join(' · '),
          ownerId: item.userId,
          visibility: stateOf(item),
          effective: index.activity(item),
          changedAt: item.visibilityChangedAt,
          changedBy: item.visibilityChangedBy ? userLabel(users.get(item.visibilityChangedBy)) : undefined,
          reason: item.visibilityReason,
          createdAt: item.createdAt,
        }))
    }
    const q = query.trim().toLowerCase()
    return rows
      .filter((row) =>
        state === 'all' ? true : state === 'moderated' ? row.effective !== 'visible' : row.effective === state,
      )
      .filter((row) => !q || row.label.toLowerCase().includes(q) || row.detail.toLowerCase().includes(q))
      .slice(0, limit)
  },

  async log(limit = 100) {
    return getStore().moderation.list(limit)
  },
}
