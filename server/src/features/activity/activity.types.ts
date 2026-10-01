/** One greenhouse (or market) action that shows in the news feed and on a plant. */
export type ActivityKind = 'photo' | 'water' | 'propagate' | 'grade' | 'passport' | 'listing' | 'scan' | 'added'

export interface Activity {
  id: string
  kind: ActivityKind
  userId: string
  plantId?: string
  /** `scan` and `added`: the Add Plant identify request behind it. */
  identifyRequestId?: string
  body: string
  bodyHe: string
  createdAt: string
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
