import type { Plant, User, Visibility } from '../../../src/mock/types.ts'
import type { Activity } from '../features/activity/activity.types.ts'
import { getStore } from '../db/index.ts'

/**
 * Moderation visibility (#68, #69). Children are never rewritten when a parent is hidden: what a viewer
 * sees is computed from the row and every ancestor (activity → plant → owner). Restoring a parent
 * brings back exactly what was there, except rows an admin hid on their own.
 *
 * - Admin: everything (the admin screens badge Hidden / Deleted).
 * - Owner: their own rows, unless the row or an ancestor is deleted.
 * - Everyone else: only rows that, with every ancestor, are visible.
 */
type Viewer = Pick<User, 'id' | 'role'> | null | undefined

const RANK: Record<Visibility, number> = { visible: 0, hidden: 1, deleted: 2 }

export function stateOf(row: { visibility?: Visibility } | undefined): Visibility {
  return row?.visibility ?? 'visible'
}

/** The stronger of two states (deleted > hidden > visible). */
export function worst(a: Visibility, b: Visibility): Visibility {
  return RANK[a] >= RANK[b] ? a : b
}

export type VisibilityIndex = {
  user(id: string): Visibility
  plant(id: string): Visibility
  activity(item: Activity): Visibility
}

/** Effective state of every user, plant and activity, including what their ancestors pass down. */
export function visibilityIndex(users: User[], plants: Plant[]): VisibilityIndex {
  const userState = new Map(users.map((user) => [user.id, stateOf(user)]))
  const plantState = new Map(
    plants.map((plant) => [plant.id, worst(stateOf(plant), userState.get(plant.ownerId) ?? 'visible')]),
  )
  return {
    user: (id) => userState.get(id) ?? 'visible',
    plant: (id) => plantState.get(id) ?? 'visible',
    activity: (item) =>
      worst(
        worst(stateOf(item), userState.get(item.userId) ?? 'visible'),
        item.plantId ? (plantState.get(item.plantId) ?? 'visible') : 'visible',
      ),
  }
}

/** May this viewer see a row with this effective state, owned by `ownerId`? */
export function canSee(state: Visibility, ownerId: string, viewer: Viewer) {
  if (viewer?.role === 'admin') return true
  if (state === 'visible') return true
  return state === 'hidden' && viewer?.id === ownerId
}

export async function loadVisibility() {
  const store = getStore()
  const [users, plants] = await Promise.all([store.users.list(), store.plants.list()])
  return visibilityIndex(users, plants)
}

export function visiblePlants(plants: Plant[], index: VisibilityIndex, viewer: Viewer) {
  return plants.filter((plant) => canSee(index.plant(plant.id), plant.ownerId, viewer))
}

export function visibleActivities(activities: Activity[], index: VisibilityIndex, viewer: Viewer) {
  return activities.filter((item) => canSee(index.activity(item), item.userId, viewer))
}

/** Users other people may see in directories and on public pages. */
export function visibleUsers(users: User[], viewer: Viewer) {
  return users.filter((user) => canSee(stateOf(user), user.id, viewer))
}
