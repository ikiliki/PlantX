import type { Catalog, CatalogProperty, Locale, QualityGrade, SizeBand, StageBand } from '../../mock/types'
import type { MarketFilterState } from '../market/marketFilters'
import type { PropertyFilterMeta } from '../market/listingFilterMeta'
import {
  CORE_PROPERTY_IDS,
  catalogName,
  optionLabel,
  propertyRelevant,
  subcategoriesFor,
  subcategoryById,
} from './catalog'

export type OthersFilterGroup = {
  id: string
  name: string
  relevant: boolean
  properties: PropertyFilterMeta[]
}

function isCoreProperty(property: CatalogProperty) {
  return (CORE_PROPERTY_IDS as readonly string[]).includes(property.id)
}

function isGeneralScope(property: CatalogProperty) {
  return property.categoryIds.length === 0 && property.subcategoryIds.length === 0
}

function belongsToCategory(catalog: Catalog, property: CatalogProperty, categoryId: string) {
  if (property.categoryIds.includes(categoryId)) return true
  const subs = subcategoriesFor(catalog, categoryId)
  return property.subcategoryIds.some((id) => subs.some((sub) => sub.id === id))
}

function filterPatch(
  propertyId: string,
  optionId: string,
  filters: MarketFilterState,
): Partial<MarketFilterState> {
  if (propertyId === 'grade') return { grades: [optionId as QualityGrade] }
  if (propertyId === 'size') return { sizes: [optionId as SizeBand] }
  if (propertyId === 'stage') return { stages: [optionId as StageBand] }
  return { traits: { ...filters.traits, [propertyId]: [optionId] } }
}

function propertyMeta(
  catalog: Catalog,
  property: CatalogProperty,
  locale: Locale,
  selectedCategoryId: string,
  subcategoryId: string,
  filters: MarketFilterState,
  count: (patch: Partial<MarketFilterState>) => number,
  includeZeroWhenIrrelevant: boolean,
): PropertyFilterMeta {
  const relevant = propertyRelevant(catalog, property, selectedCategoryId, subcategoryId)
  const options = property.options.flatMap((option) => {
    if (!relevant && includeZeroWhenIrrelevant) {
      return [{ id: option.id, name: optionLabel(option, locale), count: 0 }]
    }
    const matches = count(filterPatch(property.id, option.id, filters))
    if (matches === 0) return []
    return [{ id: option.id, name: optionLabel(option, locale), count: matches }]
  })
  return {
    id: property.id,
    name: catalogName(property, locale),
    required: property.required,
    relevant,
    options,
  }
}

/** General first, then one collapsible group per catalog category (non-core properties only). */
export function buildOthersFilterGroups(input: {
  catalog: Catalog
  locale: Locale
  selectedCategoryId: string
  subcategoryId: string
  filters: MarketFilterState
  count: (patch: Partial<MarketFilterState>) => number
  /** When true, irrelevant options appear disabled with zero count (intake list). */
  includeZeroWhenIrrelevant?: boolean
}): OthersFilterGroup[] {
  const {
    catalog,
    locale,
    selectedCategoryId,
    subcategoryId,
    filters,
    count,
    includeZeroWhenIrrelevant = false,
  } = input

  const extras = catalog.properties.filter((item) => !isCoreProperty(item))
  const groups: OthersFilterGroup[] = []

  const general = extras.filter(isGeneralScope)
  if (general.length > 0) {
    groups.push({
      id: 'general',
      name: '',
      relevant: true,
      properties: general.map((property) =>
        propertyMeta(
          catalog,
          property,
          locale,
          selectedCategoryId,
          subcategoryId,
          filters,
          count,
          includeZeroWhenIrrelevant,
        ),
      ),
    })
  }

  for (const category of catalog.categories) {
    const scoped = extras.filter(
      (property) => !isGeneralScope(property) && belongsToCategory(catalog, property, category.id),
    )
    if (scoped.length === 0) continue
    groups.push({
      id: category.id,
      name: catalogName(category, locale),
      relevant: !selectedCategoryId || selectedCategoryId === category.id,
      properties: scoped.map((property) =>
        propertyMeta(
          catalog,
          property,
          locale,
          selectedCategoryId,
          subcategoryId,
          filters,
          count,
          includeZeroWhenIrrelevant,
        ),
      ),
    })
  }

  return groups
}
