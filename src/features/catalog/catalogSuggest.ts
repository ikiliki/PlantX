import type { Catalog, CatalogSuggestion, CatalogSuggestionDraft, CatalogSuggestionInput } from '../../mock/types'

/** Shared by the Catalog form, mock mode and the server. Type imports only, so the server can load it. */

export const SUGGEST_NAME_MAX = 60
export const SUGGEST_NOTE_MAX = 400
/** A member's open suggestions at once. */
export const SUGGEST_OPEN_LIMIT = 10
const MAX_PHOTO = 700_000

export type SuggestProblem = 'name' | 'category' | 'exists' | 'photo' | 'note'

export const emptySuggestionInput: CatalogSuggestionInput = {
  name: '',
  scientificName: '',
  categoryId: '',
  note: '',
  photo: '',
}

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : ''
}

function same(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

/** Trimmed form values from a request body. */
export function readSuggestionInput(raw: unknown): CatalogSuggestionInput {
  const row = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const photo = typeof row.photo === 'string' ? row.photo : ''
  return {
    name: clean(row.name, SUGGEST_NAME_MAX),
    scientificName: clean(row.scientificName, SUGGEST_NAME_MAX),
    categoryId: clean(row.categoryId, 80),
    note: typeof row.note === 'string' ? row.note.trim().slice(0, SUGGEST_NOTE_MAX) : '',
    photo: /^data:image\//i.test(photo) ? photo : '',
  }
}

/** The catalog entry that already has this name: a category, or a variety of the chosen category. */
export function existingEntry(catalog: Catalog, input: Pick<CatalogSuggestionInput, 'name' | 'categoryId'>) {
  const name = input.name.trim()
  if (!name) return undefined
  if (input.categoryId) {
    const sub = catalog.subcategories.find((item) => item.categoryId === input.categoryId && same(item.name, name))
    return sub ? { kind: 'subcategory' as const, id: sub.id, speciesId: categorySpecies(catalog, input.categoryId) } : undefined
  }
  const category = catalog.categories.find((item) => same(item.name, name) || (item.nameHe && same(item.nameHe, name)))
  return category ? { kind: 'category' as const, id: category.id, speciesId: category.speciesId } : undefined
}

function categorySpecies(catalog: Catalog, categoryId: string) {
  return catalog.categories.find((item) => item.id === categoryId)?.speciesId
}

/** The first thing wrong with the form, or null when it can be sent. */
export function suggestionProblem(catalog: Catalog, input: CatalogSuggestionInput): SuggestProblem | null {
  if (input.name.trim().length < 2) return 'name'
  if (input.categoryId && !catalog.categories.some((item) => item.id === input.categoryId)) return 'category'
  if (existingEntry(catalog, input)) return 'exists'
  if (input.photo && input.photo.length > MAX_PHOTO) return 'photo'
  if (input.note.length > SUGGEST_NOTE_MAX) return 'note'
  return null
}

function letters(value: string, max: number) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, max)
}

/** The admin's starting draft for a member's suggestion: a new plant with one variety, or a variety of a category. */
export function memberDraft(catalog: Catalog, input: CatalogSuggestionInput): CatalogSuggestionDraft {
  const name = input.name.trim()
  const photo = input.photo.length <= MAX_PHOTO ? input.photo : ''
  const category = input.categoryId ? catalog.categories.find((item) => item.id === input.categoryId) : undefined
  if (category) {
    return {
      categoryId: category.id,
      category: { name: category.name, nameHe: category.nameHe, ticker: category.ticker, photo: category.photo },
      subcategory: { name, nameHe: '', code: letters(name, 6) || 'VAR', photo },
      properties: [],
    }
  }
  const genus = input.scientificName.trim().split(/\s+/)[0] ?? ''
  return {
    category: { name, nameHe: '', ticker: letters(genus || name, 4) || 'PLNT', photo },
    subcategory: { name, nameHe: '', code: letters(name, 6) || 'GEN', photo },
    properties: [],
  }
}

/** What a member's own list may carry: no provider, no other members. */
export function ownSuggestion(row: CatalogSuggestion, userId: string): CatalogSuggestion {
  return { ...row, provider: '', suggestedBy: row.suggestedBy.includes(userId) ? [userId] : [] }
}
