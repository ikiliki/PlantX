import { isSize, isStage } from '../../../../src/mock/catalog.ts'
import type { Catalog, PlantClassDraft, QualityGrade, SizeBand, StageBand } from '../../../../src/mock/types.ts'
import type { RawSuggestion } from './types.ts'

function norm(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Providers often leave genus empty; the first word of a binomial is the genus. */
function genusOf(raw?: RawSuggestion | null) {
  return raw?.genus || raw?.scientificName?.trim().split(/\s+/)[0]
}

function tokensOf(raw: RawSuggestion, species?: RawSuggestion | null): string[] {
  const values = [
    raw.scientificName,
    genusOf(raw),
    raw.cultivar,
    raw.label,
    ...raw.commonNames,
    species?.scientificName,
    genusOf(species),
    species?.cultivar,
    species?.label,
    ...(species?.commonNames ?? []),
  ]
  return [...new Set(values.map((item) => (item ? norm(item) : '')).filter(Boolean))]
}

function words(value: string) {
  return norm(value).split(/[^\p{L}\p{N}]+/u).filter(Boolean)
}

/** Whole words only, so "ant" does not match inside "plant" and "mon" does not match inside a longer name. */
function phraseInside(haystack: string, needle: string) {
  const hay = words(haystack)
  const pin = words(needle)
  if (pin.length === 0 || hay.length < pin.length) return false
  for (let i = 0; i <= hay.length - pin.length; i += 1) {
    if (pin.every((word, index) => hay[i + index] === word)) return true
  }
  return false
}

/**
 * Exact name is strongest. A catalog name inside the species string is next ("pothos" in "golden pothos").
 * A species phrase inside a longer catalog name counts only when it is most of that name, so "money plant"
 * does not claim "Chinese money plant". A ticker or code counts only when it is the whole token.
 */
function scoreField(needle: string, field: string, kind: 'name' | 'code') {
  if (!needle || !field) return 0
  if (norm(needle) === norm(field)) return kind === 'code' ? 80 : 1000
  if (kind === 'code') return 0
  const fieldWords = words(field)
  if (fieldWords.length === 0 || words(needle).length === 0) return 0
  if (phraseInside(needle, field) && (field.length >= 4 || fieldWords.length > 1)) return 200 + field.length
  if (phraseInside(field, needle) && needle.length >= 4 && needle.length * 5 >= field.length * 4) return 40 + needle.length
  return 0
}

function hasOption(catalog: Catalog, propertyId: string, optionId: string) {
  const prop = catalog.properties.find((item) => item.id === propertyId)
  return Boolean(prop?.options.some((opt) => opt.id === optionId))
}

function epithetOf(raw?: RawSuggestion | null) {
  const parts = raw?.scientificName?.trim().split(/\s+/) ?? []
  return parts.length > 1 ? norm(parts[1]) : ''
}

function bestId(
  needles: string[],
  rows: Array<{ id: string; name: string; nameHe: string; code: string }>,
) {
  // Ties go to the earlier needle: scientific name, genus and label before common names.
  let best: { id: string; score: number; needle: number } | undefined
  for (const row of rows) {
    const fields: Array<[string, 'name' | 'code']> = [
      [row.name, 'name'],
      [row.nameHe, 'name'],
      [row.code, 'code'],
    ]
    for (const [field, kind] of fields) {
      for (const [index, needle] of needles.entries()) {
        const score = scoreField(needle, field, kind)
        if (score <= 0) continue
        if (!best || score > best.score || (score === best.score && index < best.needle)) {
          best = { id: row.id, score, needle: index }
        }
      }
    }
  }
  return best?.id
}

function matchCategory(raw: RawSuggestion, catalog: Catalog, species?: RawSuggestion | null) {
  // The species epithet names its own category (adansonii → Swiss cheese plant).
  // Otherwise a category named the genus wins, so deliciosa stays Monstera even when
  // a shared common name like "Swiss cheese plant" also matches.
  const epithet = epithetOf(species) || epithetOf(raw)
  const epithetCategory = epithet
    ? catalog.categories.find((item) => norm(item.id) === epithet || norm(item.name) === epithet)
    : undefined
  const genus = genusOf(species) || genusOf(raw)
  const genusCategory = genus ? catalog.categories.find((item) => norm(item.name) === norm(genus)) : undefined
  const named =
    epithetCategory?.id ??
    genusCategory?.id ??
    bestId(
      tokensOf(raw, species),
      catalog.categories.map((item) => ({ id: item.id, name: item.name, nameHe: item.nameHe, code: item.ticker })),
    )
  const hinted = raw.categoryId && catalog.categories.some((item) => item.id === raw.categoryId) ? raw.categoryId : undefined
  if (named && hinted && named !== hinted) return named
  return hinted ?? named
}

function matchSubcategory(raw: RawSuggestion, catalog: Catalog, categoryId: string, species?: RawSuggestion | null) {
  const pool = catalog.subcategories.filter((item) => item.categoryId === categoryId)
  const named = bestId(
    tokensOf(raw, species),
    pool.map((item) => ({ id: item.id, name: item.name, nameHe: item.nameHe, code: item.code })),
  )
  const hinted = raw.subcategoryId && pool.some((item) => item.id === raw.subcategoryId) ? raw.subcategoryId : undefined
  if (named && hinted && named !== hinted) return named
  return hinted ?? named
}

/** Map a provider suggestion onto existing catalog ids only. Species names win over a conflicting catalog id. */
export function mapDiagnosis(raw: RawSuggestion, catalog: Catalog, species?: RawSuggestion | null): Partial<PlantClassDraft> {
  const draft: Partial<PlantClassDraft> = {}
  const categoryId = matchCategory(raw, catalog, species)
  if (categoryId) {
    draft.categoryId = categoryId
    const subcategoryId = matchSubcategory(raw, catalog, categoryId, species)
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
