import { catalogGuide } from '../../mock/catalogGuide'
import type { MockDb, Species } from '../../mock/types'

/** A catalog category as a guide, using the saved species row when one exists. */
export function catalogSpecies(db: MockDb, speciesId: string): Species | undefined {
  const category = db.catalog.categories.find((item) => item.speciesId === speciesId)
  const guide = catalogGuide(speciesId)
  const saved = db.species.find((item) => item.id === speciesId)
  if (!category && !guide && !saved) return undefined
  return {
    id: speciesId,
    commonName: saved?.commonName ?? category?.name ?? guide?.name ?? speciesId,
    commonNameHe: saved?.commonNameHe ?? category?.nameHe ?? guide?.nameHe ?? speciesId,
    scientificName: saved?.scientificName ?? guide?.scientificName ?? '',
    fungibility: saved?.fungibility ?? 'common',
    ticker: saved?.ticker ?? category?.ticker ?? guide?.ticker ?? '',
    rarity: saved?.rarity ?? guide?.rarity ?? 'common',
    growthTime: saved?.growthTime ?? guide?.growthTime ?? { en: '', he: '' },
    conditions: saved?.conditions ??
      guide?.conditions ?? { light: '', lightHe: '', water: '', waterHe: '', note: '', noteHe: '' },
  }
}

export function catalogSpeciesList(db: MockDb) {
  return db.catalog.categories
    .map((category) => catalogSpecies(db, category.speciesId))
    .filter((item): item is Species => Boolean(item))
}

/** Category photo, then each variety photo, without duplicates. */
export function catalogPhotos(db: MockDb, speciesId: string) {
  const category = db.catalog.categories.find((item) => item.speciesId === speciesId)
  const varietyPhotos = category
    ? db.catalog.subcategories.filter((item) => item.categoryId === category.id).map((item) => item.photo)
    : []
  return [...new Set([category?.photo, ...varietyPhotos].filter((photo): photo is string => Boolean(photo)))]
}
