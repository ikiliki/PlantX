import type { Catalog } from '../../../../../src/mock/types.ts'

type Category = Catalog['categories'][number]
type Subcategory = Catalog['subcategories'][number]

export type MatchPick = {
  category?: Category
  subcategory?: Subcategory
  /** Species name the fixture reports; built from catalog names so the mapper matches. */
  scientificName: string
  genus: string
  commonName: string
}

export function matchPick(catalog: Catalog): MatchPick {
  const category = catalog.categories[0]
  if (!category) {
    return { scientificName: 'Monstera deliciosa', genus: 'Monstera', commonName: 'Swiss cheese plant' }
  }
  const subcategory = catalog.subcategories.find((item) => item.categoryId === category.id)
  const name = category.name.trim()
  return {
    category,
    subcategory,
    scientificName: name,
    genus: name.split(/\s+/)[0] || name,
    commonName: name,
  }
}

export const NOT_IN_CATALOG = {
  scientificName: 'Ficus lyrata',
  authorship: 'Warb.',
  genus: 'Ficus',
  family: 'Moraceae',
  commonNames: ['Fiddle-leaf fig', 'Banjo fig'],
}

export function firstOptionId(catalog: Catalog, propertyId: string): string {
  return catalog.properties.find((item) => item.id === propertyId)?.options[0]?.id ?? ''
}
