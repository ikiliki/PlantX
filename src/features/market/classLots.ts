import type { Listing, MockDb, Plant } from '../../mock/types'

export function listingsForClass(db: MockDb, classId: string): Listing[] {
  return db.listings.filter((listing) => {
    if (listing.status !== 'active') return false
    if (listing.marketClassId === classId) return true
    const plant = db.plants.find((item) => item.id === listing.plantId)
    return plant?.marketClassId === classId
  })
}

export function plantsForClass(db: MockDb, classId: string): Plant[] {
  const seen = new Set<string>()
  const plants: Plant[] = []
  for (const listing of listingsForClass(db, classId)) {
    const plant = db.plants.find((item) => item.id === listing.plantId)
    if (!plant || seen.has(plant.id)) continue
    seen.add(plant.id)
    plants.push(plant)
  }
  if (plants.length > 0) return plants
  return db.plants.filter((plant) => plant.marketClassId === classId)
}

export function lotPhotos(db: MockDb, classId: string, fallback?: string): string[] {
  const photos: string[] = []
  const seen = new Set<string>()
  const add = (src?: string) => {
    if (!src || seen.has(src)) return
    seen.add(src)
    photos.push(src)
  }
  for (const plant of plantsForClass(db, classId)) plant.photos.forEach(add)
  add(fallback)
  return photos
}

export function listedQuantity(listings: Listing[]): number {
  return listings.reduce((sum, listing) => sum + listing.quantity, 0)
}

export function stageLabelFor(
  labels: { mature: string; established: string; rooted: string; unitCutting: string; unrooted: string },
  stage: string | undefined,
  rooting?: Plant['rooting'],
) {
  if (stage === 'MATURE') return labels.mature
  if (stage === 'EST') return labels.established
  if (stage === 'ROOTED') return labels.rooted
  if (stage === 'CUT') return labels.unitCutting
  if (rooting === 'rooted') return labels.rooted
  if (rooting === 'unrooted') return labels.unrooted
  return labels.established
}
