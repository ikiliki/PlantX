import type { Catalog, CatalogSuggestion, IdentifyMockMatch, IdentifyMockScenario } from '../../../../../src/mock/types.ts'
import { CORE_PROPERTY_IDS, propertiesForPlant } from '../../../../../src/features/catalog/catalog.ts'
import type { RawSuggestion } from '../types.ts'

const isCore = (id: string) => (CORE_PROPERTY_IDS as readonly string[]).includes(id)

export type MockPlan = {
  match?: IdentifyMockMatch
  suggestion?: CatalogSuggestion | null
}

function applyMatch(raw: RawSuggestion, catalog: Catalog, match: IdentifyMockMatch): RawSuggestion {
  const category =
    catalog.categories.find((item) => item.id === match.categoryId) ?? catalog.categories[0]
  if (!category) return raw
  const subs = catalog.subcategories.filter((item) => item.categoryId === category.id)
  const sub = match.subcategory ? subs.find((item) => item.id === match.subcategoryId) : undefined
  const props = match.properties ?? {}
  const traits: Record<string, string> = {}
  for (const [key, optionId] of Object.entries(props)) {
    if (!optionId || isCore(key)) continue
    traits[key] = optionId
  }
  // A match answers every required trait, so the default mock is a full answer. Admin picks win.
  for (const property of propertiesForPlant(catalog, category.id, sub?.id ?? '', true)) {
    if (isCore(property.id) || traits[property.id]) continue
    const first = property.options[0]?.id
    if (first) traits[property.id] = first
  }
  const name = category.name.trim()
  return {
    ...raw,
    isPlant: true,
    categoryId: category.id,
    subcategoryId: sub?.id,
    cultivar: sub?.name,
    scientificName: name,
    commonNames: [sub?.name ?? name],
    genus: name.split(/\s+/)[0] || name,
    label: sub ? `${name} '${sub.name}'` : name,
    quality: props.health || undefined,
    size: props.size || undefined,
    stage: props.stage || undefined,
    traits: Object.keys(traits).length ? traits : undefined,
  }
}

function applySuggestion(raw: RawSuggestion, suggestion: CatalogSuggestion): RawSuggestion {
  const name = suggestion.name.trim() || suggestion.scientificName.trim()
  return {
    ...raw,
    isPlant: true,
    categoryId: undefined,
    subcategoryId: undefined,
    cultivar: undefined,
    quality: undefined,
    size: undefined,
    stage: undefined,
    traits: undefined,
    scientificName: suggestion.scientificName.trim() || name,
    commonNames: suggestion.commonNames.filter(Boolean).length ? suggestion.commonNames : [name],
    genus: suggestion.genus.trim() || undefined,
    label: name,
  }
}

/** Admin match and suggestion choices, applied after the canned body is parsed. */
export function applyMockPlan(
  raw: RawSuggestion,
  catalog: Catalog,
  scenario: IdentifyMockScenario,
  plan?: MockPlan,
): RawSuggestion {
  if (!plan) return raw
  if (scenario === 'match' && plan.match) return applyMatch(raw, catalog, plan.match)
  if (scenario === 'notInCatalog' && plan.suggestion) return applySuggestion(raw, plan.suggestion)
  return raw
}
