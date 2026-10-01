import { classDictionary, type DictClass, type DictPlant } from '../../mock/classDictionary'
import { isGrade, isSize, isStage } from '../../mock/catalog'
import { buildMarketCode, buildMarketDisplay } from '../../mock/marketNaming'
import type {
  Catalog,
  CatalogCategory,
  CatalogSubcategory,
  Plant,
  PlantClassDraft,
  QualityGrade,
  SizeBand,
  StageBand,
} from '../../mock/types'
import {
  categoryById,
  categoryBySpeciesId,
  propertyById,
  subcategoriesFor,
  subcategoryOfPlant,
} from '../catalog/catalog'

export type { PlantClassDraft }

export const emptyClassDraft: PlantClassDraft = {
  categoryId: '',
  subcategoryId: '',
  quality: '',
  size: '',
  stage: '',
  traits: {},
}

export function dictCategory(id: string): DictPlant | undefined {
  return classDictionary.find((plant) => plant.id === id)
}

function uniqueBy<T>(items: T[], key: (item: T) => string) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const value = key(item)
    if (seen.has(value)) return false
    seen.add(value)
    return true
  })
}

export function classesFor(draft: PlantClassDraft, facet: 'variety' | 'grade' | 'size' | 'stage') {
  const plant = dictCategory(draft.categoryId)
  if (!plant) return []
  const sub = plant.classes.find((item) => `${plant.id}-${item.varietyCode.toLowerCase()}` === draft.subcategoryId)
  const varietyCode = sub?.varietyCode
  return plant.classes.filter((item) => {
    if (facet === 'variety') return true
    if (varietyCode && item.varietyCode !== varietyCode) return false
    if (facet === 'grade') return true
    if (draft.quality && item.quality !== draft.quality) return false
    if (facet === 'size') return true
    if (draft.size && item.size !== draft.size) return false
    return true
  })
}

export function subcategoryChoices(catalog: Catalog, draft: PlantClassDraft): CatalogSubcategory[] {
  return subcategoriesFor(catalog, draft.categoryId)
}

export function gradeChoices(catalog: Catalog, draft: PlantClassDraft) {
  const fromClasses = uniqueBy(classesFor(draft, 'grade'), (item) => item.quality).map((item) => item.quality)
  if (fromClasses.length > 0) return fromClasses
  return propertyById(catalog, 'grade')?.options.map((item) => item.id).filter(isGrade) ?? []
}

export function sizeChoices(catalog: Catalog, draft: PlantClassDraft) {
  const fromClasses = uniqueBy(classesFor(draft, 'size'), (item) => item.size).map((item) => item.size)
  if (fromClasses.length > 0) return fromClasses
  return propertyById(catalog, 'size')?.options.map((item) => item.id).filter(isSize) ?? []
}

export function stageChoices(catalog: Catalog, draft: PlantClassDraft) {
  const fromClasses = uniqueBy(classesFor(draft, 'stage'), (item) => item.stage).map((item) => item.stage)
  if (fromClasses.length > 0) return fromClasses
  return propertyById(catalog, 'stage')?.options.map((item) => item.id).filter(isStage) ?? []
}

export function matchClass(draft: PlantClassDraft): DictClass | undefined {
  if (!draft.categoryId || !draft.quality || !draft.size || !draft.stage) return undefined
  const plant = dictCategory(draft.categoryId)
  if (!plant) return undefined
  const subCode = plant.classes.find(
    (item) => `${plant.id}-${item.varietyCode.toLowerCase()}` === draft.subcategoryId,
  )?.varietyCode
  return plant.classes.find(
    (item) =>
      (!subCode || item.varietyCode === subCode) &&
      item.quality === draft.quality &&
      item.size === draft.size &&
      item.stage === draft.stage,
  )
}

export type CatalogPhotoSource = {
  photo: string
  /** The row that owns the photo: the subcategory when it has one, else the category. */
  source: CatalogCategory | CatalogSubcategory
}

function catalogPhotoSource(
  category: CatalogCategory | undefined,
  sub: CatalogSubcategory | undefined,
): CatalogPhotoSource | undefined {
  if (sub?.photo) return { photo: sub.photo, source: sub }
  if (category?.photo) return { photo: category.photo, source: category }
  return undefined
}

/** Photo follows the category, then the subcategory when that row has one. Property combinations do not pick a photo yet. */
export function catalogChoiceSource(catalog: Catalog, draft: PlantClassDraft) {
  const category = categoryById(catalog, draft.categoryId)
  if (!category) return undefined
  const sub = catalog.subcategories.find((item) => item.id === draft.subcategoryId)
  return catalogPhotoSource(category, sub)
}

export function catalogChoicePhoto(catalog: Catalog, draft: PlantClassDraft) {
  return catalogChoiceSource(catalog, draft)?.photo ?? ''
}

/** Catalog icon for a saved plant. Derived from its category and subcategory, never stored in `plant.photos`. */
export function plantCatalogSource(catalog: Catalog | undefined, plant: Plant) {
  if (!catalog) return undefined
  const sub = subcategoryOfPlant(catalog, plant)
  const category = sub ? categoryById(catalog, sub.categoryId) : categoryBySpeciesId(catalog, plant.speciesId)
  return catalogPhotoSource(category, sub)
}

export function plantCatalogPhoto(catalog: Catalog | undefined, plant: Plant) {
  return plantCatalogSource(catalog, plant)?.photo ?? ''
}

export function synthesizeClass(
  catalog: Catalog,
  draft: PlantClassDraft,
): DictClass | undefined {
  if (!draft.categoryId || !draft.size || !draft.stage) return undefined
  const category = categoryById(catalog, draft.categoryId)
  if (!category) return undefined
  const subs = subcategoriesFor(catalog, draft.categoryId)
  if (subs.length > 0 && !draft.subcategoryId) return undefined
  const sub = catalog.subcategories.find((item) => item.id === draft.subcategoryId)
  const variety = sub?.name ?? category.name
  const varietyHe = sub?.nameHe ?? category.nameHe
  const varietyCode = sub?.code ?? 'STD'
  const photo = catalogChoicePhoto(catalog, draft)
  const matched = matchClass(draft)
  if (matched) return { ...matched, photo }
  return {
    code: buildMarketCode({
      ticker: category.ticker,
      varietyCode,
      quality: draft.quality,
      size: draft.size,
      stage: draft.stage,
    }),
    name: buildMarketDisplay({
      species: category.name,
      variety,
      quality: draft.quality,
      size: draft.size,
      stage: draft.stage,
      locale: 'en',
    }),
    nameHe: buildMarketDisplay({
      species: category.nameHe,
      variety: varietyHe,
      quality: draft.quality,
      size: draft.size,
      stage: draft.stage,
      locale: 'he',
    }),
    photo,
    variety,
    varietyHe,
    varietyCode,
    quality: draft.quality,
    size: draft.size,
    stage: draft.stage,
    author: 'PlantX catalog',
    license: 'Catalog',
    licenseUrl: '',
    source: '',
    observed: '',
    observedHe: '',
  }
}

/** Keep only choices that still exist after an earlier field changes. */
export function narrowDraft(catalog: Catalog, draft: PlantClassDraft): PlantClassDraft {
  const next = { ...draft, traits: { ...draft.traits } }
  const subs = subcategoryChoices(catalog, next)
  if (!subs.some((item) => item.id === next.subcategoryId)) {
    next.subcategoryId = subs.length === 1 ? subs[0].id : ''
  }
  const sizes = sizeChoices(catalog, next)
  if (!next.size || !sizes.includes(next.size)) {
    next.size = sizes.length === 1 ? sizes[0] : ''
  }
  const stages = stageChoices(catalog, next)
  if (!next.stage || !stages.includes(next.stage)) {
    next.stage = stages.length === 1 ? stages[0] : ''
  }
  return next
}
