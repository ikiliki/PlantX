import type { Catalog } from '../../../../src/mock/types.ts'
import { cleanCareCatalog, mergeAiRules } from '../../../../src/features/todo/carePlan.ts'
import { suggestCarePlan } from '../identify/providers/gemini.ts'
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
    // Care tasks and rules: sane values only. A save without them (an older client) keeps the stored ones,
    // because dropping a task deletes every task row of that kind.
    const current = Array.isArray(raw.careTasks) ? null : await store.catalog.get()
    const care = cleanCareCatalog(current?.careTasks ?? raw.careTasks, current?.careRules ?? raw.careRules, {
      categoryIds: new Set(raw.categories.map((item) => item.id)),
      subcategoryIds: new Set(raw.subcategories.map((item) => item.id)),
    })
    await store.catalog.save({ ...raw, ...care })
    return store.catalog.get()
  },
  /**
   * "Suggest with AI" for one category (admin): Gemini proposes its care rules (and variety rules where a
   * variety differs). They replace this category's AI rules; rules the admin set stay as they are.
   */
  async suggestCare(categoryId: string) {
    const catalog = await catalogService.get()
    const category = catalog.categories.find((item) => item.id === categoryId)
    if (!category) throw Errors.missing(`Category ${categoryId} not found`)
    const varieties = catalog.subcategories.filter((item) => item.categoryId === categoryId)
    const suggested = await suggestCarePlan({
      category: category.name,
      varieties: varieties.map((item) => ({ id: item.id, name: item.name })),
      tasks: catalog.careTasks.map((task) => ({ id: task.id, name: task.name, audience: task.audience })),
    })
    if (!suggested) throw Errors.internal('AI could not suggest care right now')
    const careRules = mergeAiRules(
      catalog.careRules,
      categoryId,
      suggested.map((rule) => ({
        taskId: rule.taskId,
        categoryId,
        subcategoryId: rule.subcategoryId,
        mode: rule.mode,
        interval: rule.everyDays ? { everyDays: rule.everyDays, winterEveryDays: rule.winterEveryDays, months: rule.months } : undefined,
      })),
    )
    return catalogService.save({ ...catalog, careRules })
  },
}
