import { OTHER_SPECIES_ID, OTHER_SUBCATEGORY_ID } from './identification'
import { classDictionary, type DictClass, type DictPlant } from '../../mock/classDictionary'
import { isHealth, isSize, isStage } from '../../mock/catalog'
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

/** Identity choice when the plant is not a catalog category. */
export const OTHER_CATEGORY_ID = OTHER_SPECIES_ID

/** Subcategory choice when the variety is not in the catalog. Not stored on the plant. */
export { OTHER_SUBCATEGORY_ID }

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

export function classesFor(draft: PlantClassDraft, facet: 'variety' | 'health' | 'size' | 'stage') {
  const plant = dictCategory(draft.categoryId)
  if (!plant) return []
  const sub = plant.classes.find((item) => `${plant.id}-${item.varietyCode.toLowerCase()}` === draft.subcategoryId)
  const varietyCode = sub?.varietyCode
  return plant.classes.filter((item) => {
    if (facet === 'variety') return true
    if (varietyCode && item.varietyCode !== varietyCode) return false
    if (facet === 'health') return true
    if (draft.quality && item.quality !== draft.quality) return false
    if (facet === 'size') return true
    if (draft.size && item.size !== draft.size) return false
    return true
  })
}

export function subcategoryChoices(catalog: Catalog, draft: PlantClassDraft): CatalogSubcategory[] {
  return subcategoriesFor(catalog, draft.categoryId)
}

export function healthChoices(catalog: Catalog, draft: PlantClassDraft) {
  const fromClasses = uniqueBy(classesFor(draft, 'health'), (item) => item.quality).map((item) => item.quality)
  if (fromClasses.length > 0) return fromClasses
  return propertyById(catalog, 'health')?.options.map((item) => item.id).filter(isHealth) ?? []
}

const FALLBACK_SIZES: SizeBand[] = ['S', 'M', 'L', 'XL']
const FALLBACK_STAGES: StageBand[] = ['CUT', 'ROOTED', 'EST', 'MATURE']

function optionIds<T extends string>(catalog: Catalog, propertyId: string, keep: (id: string) => id is T) {
  return propertyById(catalog, propertyId)?.options.map((item) => item.id).filter(keep) ?? []
}

/** Smallest to largest, and cutting to mature, whatever order the class list had. */
const bySize = (a: SizeBand, b: SizeBand) => FALLBACK_SIZES.indexOf(a) - FALLBACK_SIZES.indexOf(b)
const byStage = (a: StageBand, b: StageBand) => FALLBACK_STAGES.indexOf(a) - FALLBACK_STAGES.indexOf(b)

export function sizeChoices(catalog: Catalog, draft: PlantClassDraft): SizeBand[] {
  const fromClasses = uniqueBy(classesFor(draft, 'size'), (item) => item.size).map((item) => item.size)
  if (fromClasses.length > 0) return fromClasses.sort(bySize)
  const fromCatalog = optionIds(catalog, 'size', isSize)
  if (fromCatalog.length > 0) return fromCatalog.sort(bySize)
  return FALLBACK_SIZES
}

/**
 * Every stage the catalog offers, whatever the size or variety: an XL plant can still be juvenile,
 * so size does not narrow stage, and the grower always picks it.
 */
export function stageChoices(catalog: Catalog, _draft?: PlantClassDraft): StageBand[] {
  const fromCatalog = optionIds(catalog, 'stage', isStage)
  if (fromCatalog.length > 0) return fromCatalog.sort(byStage)
  return FALLBACK_STAGES
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
  const otherSub = draft.subcategoryId === OTHER_SUBCATEGORY_ID
  const subs = subcategoriesFor(catalog, draft.categoryId)
  if (!otherSub && subs.length > 0 && !draft.subcategoryId) return undefined
  const sub = otherSub ? undefined : catalog.subcategories.find((item) => item.id === draft.subcategoryId)
  const variety = otherSub ? 'Other' : (sub?.name ?? category.name)
  const varietyHe = otherSub ? 'אחר' : (sub?.nameHe ?? category.nameHe)
  const varietyCode = otherSub ? 'OTH' : (sub?.code ?? 'STD')
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

/** A plant the catalog does not know yet. Size and stage still apply; there is no subcategory. */
export function otherClass(
  draft: PlantClassDraft,
  names: { name: string; nameHe: string },
): DictClass | undefined {
  if (draft.categoryId !== OTHER_CATEGORY_ID || !draft.size || !draft.stage) return undefined
  const name = names.name.trim() || 'Other'
  const nameHe = names.nameHe.trim() || name
  return {
    code: buildMarketCode({
      ticker: 'OTH',
      varietyCode: 'OTH',
      quality: draft.quality,
      size: draft.size,
      stage: draft.stage,
    }),
    name: buildMarketDisplay({
      species: name,
      variety: name,
      quality: draft.quality,
      size: draft.size,
      stage: draft.stage,
      locale: 'en',
    }),
    nameHe: buildMarketDisplay({
      species: nameHe,
      variety: nameHe,
      quality: draft.quality,
      size: draft.size,
      stage: draft.stage,
      locale: 'he',
    }),
    photo: '',
    variety: name,
    varietyHe: nameHe,
    varietyCode: 'OTH',
    quality: draft.quality,
    size: draft.size,
    stage: draft.stage,
    author: 'PlantX catalog',
    license: 'Catalog',
    licenseUrl: '',
    source: '',
    observed: name,
    observedHe: nameHe,
  }
}

/**
 * Keep only choices that still exist after an earlier field changes.
 * `fillSingle`: pick a size or stage when it has only one choice. Off on the AI path, where a value
 * the AI did not suggest stays empty so the owner fills it by hand.
 */
export function narrowDraft(
  catalog: Catalog,
  draft: PlantClassDraft,
  { fillSingle = true }: { fillSingle?: boolean } = {},
): PlantClassDraft {
  const next = { ...draft, traits: { ...draft.traits } }
  if (next.categoryId === OTHER_CATEGORY_ID) {
    next.subcategoryId = OTHER_SUBCATEGORY_ID
  } else if (next.subcategoryId !== OTHER_SUBCATEGORY_ID) {
    const subs = subcategoryChoices(catalog, next)
    if (!subs.some((item) => item.id === next.subcategoryId)) {
      next.subcategoryId = subs.length === 1 ? subs[0].id : subs.length === 0 ? OTHER_SUBCATEGORY_ID : ''
    }
  }
  const sizes = sizeChoices(catalog, next)
  if (!next.size || !sizes.includes(next.size)) {
    next.size = fillSingle && sizes.length === 1 ? sizes[0] : ''
  }
  // Stage is never picked for the grower, even when one option is left.
  if (next.stage && !stageChoices(catalog, next).includes(next.stage)) next.stage = ''
  return next
}
