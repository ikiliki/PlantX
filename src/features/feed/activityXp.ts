import { CARE_XP, PLANT_XP } from '../greenhouse/greenhouseLevel'
import type { FeedUpdateKind, User } from '../../mock/types'

/** Shared by the server (who may read an activity) and the client (feed, rows). Pure, no React. */

/** XP an activity earned: a new plant, or completed care (water, photo). Other kinds earn none. */
export function activityXp(kind: FeedUpdateKind): number | undefined {
  if (kind === 'added') return PLANT_XP
  if (kind === 'water' || kind === 'photo') return CARE_XP
  return undefined
}

/** For now only activities that earn XP are public; the rest stay in the owner's greenhouse activity. */
export function isPublicActivity(kind: FeedUpdateKind) {
  return activityXp(kind) != null
}

/** Public kinds for everyone; every kind for its owner and for an admin. */
export function canSeeActivity(
  activity: { kind: FeedUpdateKind; userId: string },
  viewer: Pick<User, 'id' | 'role'> | null | undefined,
) {
  if (isPublicActivity(activity.kind)) return true
  if (!viewer) return false
  return viewer.role === 'admin' || viewer.id === activity.userId
}
