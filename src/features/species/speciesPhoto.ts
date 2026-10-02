import type { MockDb } from '../../mock/types'

export function speciesPhoto(db: MockDb, speciesId: string) {
  const fromCatalog = db.catalog.categories.find((item) => item.speciesId === speciesId)?.photo
  if (fromCatalog) return fromCatalog
  const fromClass = db.marketClasses.find((item) => item.speciesId === speciesId)?.photo
  if (fromClass) return fromClass
  return db.plants.find((item) => item.speciesId === speciesId && item.photos[0])?.photos[0]
}
