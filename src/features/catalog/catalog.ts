import type {
  Catalog,
  CatalogCategory,
  CatalogProperty,
  CatalogSubcategory,
  Locale,
  Plant,
} from '../../mock/types'

export const CORE_PROPERTY_IDS = ['health', 'size', 'stage', 'area'] as const

export function catalogName(
  item: { name: string; nameHe: string },
  locale: Locale,
) {
  return locale === 'he' ? item.nameHe : item.name
}

export function propertyChipText(property: CatalogProperty, locale: Locale) {
  const name = catalogName(property, locale)
  const required = property.required ? ' *' : ''
  const sign = property.inMarketName && property.sign ? ` · ${property.sign}` : ''
  return `${name}${required}${sign}`
}

export function optionLabel(
  option: { label: string; labelHe: string },
  locale: Locale,
) {
  return locale === 'he' ? option.labelHe : option.label
}

export function categoryById(catalog: Catalog, id: string) {
  return catalog.categories.find((item) => item.id === id)
}

export function categoryBySpeciesId(catalog: Catalog, speciesId: string) {
  return catalog.categories.find((item) => item.speciesId === speciesId)
}

export function subcategoryById(catalog: Catalog, id: string) {
  return catalog.subcategories.find((item) => item.id === id)
}

export function subcategoriesFor(catalog: Catalog, categoryId: string) {
  return catalog.subcategories.filter((item) => item.categoryId === categoryId)
}

export function requiredProperties(catalog: Catalog) {
  return catalog.properties.filter((item) => item.required)
}

export function uniqueProperties(catalog: Catalog) {
  return catalog.properties.filter((item) => !item.required)
}

export function propertyById(catalog: Catalog, id: string) {
  return catalog.properties.find((item) => item.id === id)
}

/** A property applies when no taxonomy is selected, or when the selection is inside its scope. */
export function propertyRelevant(
  catalog: Catalog,
  property: CatalogProperty,
  categoryId: string,
  subcategoryId: string,
) {
  if (property.subcategoryIds.length > 0) {
    if (subcategoryId) return property.subcategoryIds.includes(subcategoryId)
    if (categoryId) {
      return property.subcategoryIds.some((id) => subcategoryById(catalog, id)?.categoryId === categoryId)
    }
    return true
  }
  if (property.categoryIds.length > 0) {
    if (categoryId) return property.categoryIds.includes(categoryId)
    if (subcategoryId) {
      const sub = subcategoryById(catalog, subcategoryId)
      return Boolean(sub && property.categoryIds.includes(sub.categoryId))
    }
    return true
  }
  return true
}

export function propertiesForPlant(
  catalog: Catalog,
  categoryId: string,
  subcategoryId: string,
  required: boolean,
) {
  return catalog.properties.filter((item) => {
    if (item.required !== required) return false
    if (!categoryId && !subcategoryId) return item.categoryIds.length === 0 && item.subcategoryIds.length === 0
    if (item.subcategoryIds.length > 0) return Boolean(subcategoryId) && item.subcategoryIds.includes(subcategoryId)
    if (item.categoryIds.length > 0) return Boolean(categoryId) && item.categoryIds.includes(categoryId)
    return true
  })
}

export function plantPropertyValue(plant: Plant, propertyId: string) {
  if (propertyId === 'health') return plant.quality
  if (propertyId === 'size') return plant.sizeBand
  if (propertyId === 'stage') return plant.stage
  if (propertyId === 'area') return plant.traits?.area
  return plant.traits?.[propertyId]
}

export function uniqueGroups(
  catalog: Catalog,
  locale: Locale,
  categoryId: string,
  subcategoryId: string,
) {
  const groups: {
    category: CatalogCategory
    relevant: boolean
    properties: { property: CatalogProperty; relevant: boolean }[]
  }[] = []

  for (const category of catalog.categories) {
    const scoped = uniqueProperties(catalog).filter((item) => {
      if (item.categoryIds.includes(category.id)) return true
      const subs = subcategoriesFor(catalog, category.id)
      return item.subcategoryIds.some((id) => subs.some((sub) => sub.id === id))
    })
    if (scoped.length === 0) continue
    groups.push({
      category,
      relevant: !categoryId || categoryId === category.id,
      properties: scoped.map((property) => ({
        property,
        relevant: propertyRelevant(catalog, property, categoryId, subcategoryId),
      })),
    })
  }

  return groups.map((group) => ({
    ...group,
    name: catalogName(group.category, locale),
  }))
}

export function subcategoryOfPlant(catalog: Catalog, plant: Plant): CatalogSubcategory | undefined {
  if (plant.subcategoryId) return subcategoryById(catalog, plant.subcategoryId)
  const category = categoryBySpeciesId(catalog, plant.speciesId)
  if (!category) return undefined
  return catalog.subcategories.find(
    (item) =>
      item.categoryId === category.id &&
      (item.name === plant.variety || item.nameHe === plant.varietyHe),
  )
}
