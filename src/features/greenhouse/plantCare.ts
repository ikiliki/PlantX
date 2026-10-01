import type { Plant } from '../../mock/types'

/** A living listing needs a new photo once a week. */
export const PHOTO_WEEK_MS = 7 * 24 * 60 * 60 * 1000

export function lastPhotoAt(plant: Pick<Plant, 'photoAt'>) {
  return plant.photoAt
}

/** Listed plants with a photo date older than a week. A missing date is not overdue. */
export function isPhotoStale(plant: Plant, now = Date.now()) {
  if (plant.status !== 'listed' || !plant.photoAt) return false
  const then = new Date(plant.photoAt).getTime()
  if (Number.isNaN(then)) return false
  return now - then >= PHOTO_WEEK_MS
}

/** Owned or listed plants that have not been watered in the last week. */
export function isWaterDue(plant: Plant, now = Date.now()) {
  if (plant.status === 'sold') return false
  if (!plant.wateredAt) return true
  const then = new Date(plant.wateredAt).getTime()
  if (Number.isNaN(then)) return true
  return now - then >= PHOTO_WEEK_MS
}
