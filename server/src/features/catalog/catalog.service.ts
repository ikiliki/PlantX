import type { Catalog, CatalogCategory, CatalogProperty, CatalogSubcategory } from '../../../../src/mock/types.ts'
import { Errors } from '../../lib/errors.ts'
import { fileExists, readJson, writeJson } from '../../lib/jsonStore.ts'

const CATEGORIES = 'catalog-categories.json'
const SUBCATEGORIES = 'catalog-subcategories.json'
const PROPERTIES = 'catalog-properties.json'
const LEGACY = 'catalog.json'

export const EMPTY_CATALOG: Catalog = {
  categories: [],
  subcategories: [],
  properties: [],
}

function readTable<T>(name: string): T[] {
  return readJson<T[]>(name, [])
}

function tablesExist() {
  return fileExists(CATEGORIES) || fileExists(SUBCATEGORIES) || fileExists(PROPERTIES)
}

function assemble(): Catalog {
  return {
    categories: readTable<CatalogCategory>(CATEGORIES),
    subcategories: readTable<CatalogSubcategory>(SUBCATEGORIES),
    properties: readTable<CatalogProperty>(PROPERTIES),
  }
}

export const catalogService = {
  counts() {
    const catalog = catalogService.get()
    return {
      categories: catalog.categories.length,
      subcategories: catalog.subcategories.length,
      properties: catalog.properties.length,
    }
  },

  /** Categories, subcategories, and properties are separate JSON tables. */
  get() {
    if (tablesExist()) return assemble()
    if (!fileExists(LEGACY)) return structuredClone(EMPTY_CATALOG)
    const legacy = readJson<Catalog>(LEGACY, EMPTY_CATALOG)
    catalogService.save(legacy)
    return catalogService.get()
  },

  save(raw: Catalog) {
    if (!raw || !Array.isArray(raw.categories) || !Array.isArray(raw.subcategories) || !Array.isArray(raw.properties)) {
      throw Errors.invalid('Catalog must include categories, subcategories, and properties arrays')
    }
    writeJson(CATEGORIES, raw.categories)
    writeJson(SUBCATEGORIES, raw.subcategories)
    writeJson(PROPERTIES, raw.properties)
    return assemble()
  },
}
