import type { FeedUpdateKind } from '../../mock/types'

const KIND_KEY = {
  photo: 'updatePhoto',
  water: 'updateWater',
  propagate: 'updatePropagate',
  grade: 'updateGrade',
  passport: 'updatePassport',
  listing: 'updateListing',
  scan: 'updateScan',
  added: 'updateAdded',
  edited: 'updateEdited',
  deleted: 'updateDeleted',
} as const satisfies Record<FeedUpdateKind, keyof { updatePhoto: string; updateWater: string; updatePropagate: string; updateGrade: string; updatePassport: string; updateListing: string; updateScan: string; updateAdded: string; updateEdited: string; updateDeleted: string }>

export function activityKindLabel(
  kind: FeedUpdateKind,
  feed: { [K in (typeof KIND_KEY)[FeedUpdateKind]]: string },
) {
  return feed[KIND_KEY[kind]]
}

/** Added, grade, and passport open the plant passport. Every other kind opens the small tinted popup. */
export function momentPassportTab(kind: FeedUpdateKind): 'grading' | 'activity' | null {
  if (kind === 'added' || kind === 'grade') return 'grading'
  if (kind === 'passport' || kind === 'edited') return 'activity'
  return null
}
