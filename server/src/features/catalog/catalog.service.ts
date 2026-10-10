import type { Catalog } from '../../../../src/mock/types.ts'
import { cleanCarePlan } from '../../../../src/features/todo/carePlan.ts'
import { getStore } from '../../db/index.ts'
import { Errors } from '../../lib/errors.ts'

export const catalogService = {
  async counts() {
    const catalog = await catalogService.get()
    return {
      categories: catalog.categories.length,
      subcategories: catalog.subcategories.length,
      properties: catalog.properties.length,
    }
  },

  async get() {
    return getStore().catalog.get()
  },

  async save(raw: Catalog) {
    if (!raw || !Array.isArray(raw.categories) || !Array.isArray(raw.subcategories) || !Array.isArray(raw.properties)) {
      throw Errors.invalid('Catalog must include categories, subcategories, and properties arrays')
    }
    const store = getStore()
    // Care plans keep only known kinds and sane intervals.
    const withCare = <T extends { care?: unknown }>(item: T) => ({ ...item, care: cleanCarePlan(item.care) })
    await store.catalog.save({
      ...raw,
      categories: raw.categories.map(withCare),
      subcategories: raw.subcategories.map(withCare),
    })
    return store.catalog.get()
  },
}
