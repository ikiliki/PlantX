import { isSize, isStage } from '../../../../src/mock/catalog.ts'
import type { Catalog, PlantClassDraft, QualityGrade, SizeBand, StageBand } from '../../../../src/mock/types.ts'
import type { RawSuggestion } from './types.ts'

function norm(value: string) {
  return value.trim().toLowerCase()
}

function tokensOf(raw: RawSuggestion): string[] {
  const values = [raw.scientificName, raw.genus, raw.cultivar, ...raw.commonNames]
  return values.map((item) => (item ? norm(item) : '')).filter(Boolean)
}

function looseMatch(a: string, b: string) {
  if (!a || !b) return false
  if (a === b) return true
  if (a.length < 3 || b.length < 3) return false
  return a.includes(b) || b.includes(a)
}

function hasOption(catalog: Catalog, propertyId: string, optionId: string) {
  const prop = catalog.properties.find((item) => item.id === propertyId)
  return Boolean(prop?.options.some((opt) => opt.id === optionId))
}

function matchCategory(raw: RawSuggestion, catalog: Catalog) {
  if (raw.categoryId && catalog.categories.some((item) => item.id === raw.categoryId)) {
    return raw.categoryId
  }
  const needles = tokensOf(raw)
  let best: { id: string; score: number } | undefined
  for (const category of catalog.categories) {
    const fields = [category.name, category.nameHe, category.ticker].map(norm)
    for (const field of fields) {
      for (const needle of needles) {
        if (!looseMatch(needle, field)) continue
        const score = needle === field ? 3 : Math.min(needle.length, field.length)
        if (!best || score > best.score) best = { id: category.id, score }
      }
    }
  }
  return best?.id
}

function matchSubcategory(raw: RawSuggestion, catalog: Catalog, categoryId: string) {
  if (
    raw.subcategoryId &&
    catalog.subcategories.some((item) => item.id === raw.subcategoryId && item.categoryId === categoryId)
  ) {
    return raw.subcategoryId
  }
  const cultivar = raw.cultivar ? norm(raw.cultivar) : ''
  const needles = [cultivar, ...tokensOf(raw)].filter(Boolean)
  const pool = catalog.subcategories.filter((item) => item.categoryId === categoryId)
  let best: { id: string; score: number } | undefined
  for (const sub of pool) {
    const fields = [sub.name, sub.nameHe, sub.code].map(norm)
    for (const field of fields) {
      for (const needle of needles) {
        if (!looseMatch(needle, field)) continue
        const score = needle === field ? 3 : Math.min(needle.length, field.length)
        if (!best || score > best.score) best = { id: sub.id, score }
      }
    }
  }
  return best?.id
}

/** Map a provider suggestion onto existing catalog ids only. */
export function mapDiagnosis(raw: RawSuggestion, catalog: Catalog): Partial<PlantClassDraft> {
  const draft: Partial<PlantClassDraft> = {}
  const categoryId = matchCategory(raw, catalog)
  if (categoryId) {
    draft.categoryId = categoryId
    const subcategoryId = matchSubcategory(raw, catalog, categoryId)
    if (subcategoryId) draft.subcategoryId = subcategoryId
  }

  if (raw.quality && hasOption(catalog, 'health', raw.quality)) {
    draft.quality = raw.quality as QualityGrade
  }
  if (raw.size && (isSize(raw.size) || hasOption(catalog, 'size', raw.size))) {
    draft.size = raw.size as SizeBand
  }
  if (raw.stage && (isStage(raw.stage) || hasOption(catalog, 'stage', raw.stage))) {
    draft.stage = raw.stage as StageBand
  }

  if (raw.traits) {
    const traits: Record<string, string> = {}
    for (const [propertyId, optionId] of Object.entries(raw.traits)) {
      if (['health', 'size', 'stage', 'area'].includes(propertyId)) continue
      if (!optionId) continue
      if (!hasOption(catalog, propertyId, optionId)) continue
      traits[propertyId] = optionId
    }
    if (Object.keys(traits).length) draft.traits = traits
  }

  return draft
}
