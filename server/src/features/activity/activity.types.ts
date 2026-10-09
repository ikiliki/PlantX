import type { FeedUpdateKind, VisibilityMeta } from '../../../../src/mock/types.ts'

/** One greenhouse (or market) action that shows in the news feed and on a plant. */
export type ActivityKind = FeedUpdateKind

export interface Activity extends VisibilityMeta {
  id: string
  kind: ActivityKind
  userId: string
  plantId?: string
  /** `scan` and `added`: the Add Plant identify request behind it. `deleted` has no plantId (the plant is gone). */
  identifyRequestId?: string
  body: string
  bodyHe: string
  createdAt: string
  /** Per viewer, added on the way out (`visibleTo`); never stored on the activity row. */
  reactions?: number
  reacted?: boolean
  comments?: number
}

export type ActivityInput = Omit<Activity, 'id' | 'createdAt'> & {
  id?: string
  createdAt?: string
}

export type ActivityQuery = {
  plantId?: string
  userId?: string
  kind?: ActivityKind
  limit?: number
}
