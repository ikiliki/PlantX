import type { CatalogSuggestionDraft, SuggestedProperty } from '../../../../src/mock/types.ts'

export type CatalogDraftHint = {
  name: string
  scientificName: string
  genus: string
  commonNames: string[]
  provider: string
  cultivar?: string
  photo: string
  takenSigns: string[]
}

const MAX_PHOTO = 700_000

export function usablePhoto(photo: string) {
  if (!/^data:image\//i.test(photo)) return ''
  return photo.length <= MAX_PHOTO ? photo : ''
}

export function tickerFromPlant(genus: string, scientificName: string) {
  const word = (genus || scientificName).replace(/[^A-Za-z]/g, '')
  return word.slice(0, 4).toUpperCase() || 'PLNT'
}

function letters(value: string, max: number) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, max)
}

function codeOf(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 8)
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export function fallbackDraft(hint: CatalogDraftHint): CatalogSuggestionDraft {
  const photo = usablePhoto(hint.photo)
  const name = hint.name.trim() || hint.scientificName.trim() || 'Plant'
  const sub = hint.cultivar?.trim() || hint.commonNames.find(Boolean)?.trim() || name
  return {
    category: {
      name,
      nameHe: '',
      ticker: tickerFromPlant(hint.genus, hint.scientificName),
      photo,
    },
    subcategory: {
      name: sub,
      nameHe: '',
      code: letters(sub, 6) || 'GEN',
      photo,
    },
    properties: [],
  }
}

function parseProperty(value: unknown, taken: Set<string>): SuggestedProperty | undefined {
  if (!value || typeof value !== 'object') return undefined
  const row = value as Record<string, unknown>
  const name = text(row.name)
  if (!name || /^(grade|size|stage)$/i.test(name)) return undefined
  const scope = row.scope === 'subcategory' ? 'subcategory' : 'category'
  let inMarketName = row.inMarketName === true
  let sign = inMarketName ? letters(text(row.sign), 3) : ''
  if (inMarketName && (!sign || taken.has(sign))) {
    inMarketName = false
    sign = ''
  }
  const optionSigns = new Set<string>()
  const options = (Array.isArray(row.options) ? row.options : [])
    .map((option) => {
      if (!option || typeof option !== 'object') return undefined
      const item = option as Record<string, unknown>
      const label = text(item.label)
      const optionSign = letters(text(item.sign), 3)
      if (!label || !optionSign || optionSigns.has(optionSign)) return undefined
      optionSigns.add(optionSign)
      return { label, labelHe: text(item.labelHe) || label, sign: optionSign }
    })
    .filter((option): option is SuggestedProperty['options'][number] => Boolean(option))
    .slice(0, 6)
  if (options.length < 2) return undefined
  if (sign) taken.add(sign)
  return {
    name,
    nameHe: text(row.nameHe) || name,
    required: row.required === true,
    inMarketName,
    sign,
    scope,
    options,
  }
}

/** Keep a Gemini object inside the catalog draft shape. Missing text falls back to the identify names. */
export function normalizeDraft(raw: unknown, hint: CatalogDraftHint): CatalogSuggestionDraft {
  const base = fallbackDraft(hint)
  if (!raw || typeof raw !== 'object') return base
  const row = raw as Record<string, unknown>
  const taken = new Set(hint.takenSigns.map((sign) => letters(sign, 3)).filter(Boolean))
  const properties = (Array.isArray(row.properties) ? row.properties : [])
    .map((item) => parseProperty(item, taken))
    .filter((item): item is SuggestedProperty => Boolean(item))
    .slice(0, 4)
  const categoryName = text(row.categoryName) || base.category.name
  const subName = text(row.subcategoryName) || base.subcategory.name
  return {
    category: {
      name: categoryName,
      nameHe: text(row.categoryNameHe),
      ticker: letters(text(row.ticker), 6) || base.category.ticker,
      photo: base.category.photo,
    },
    subcategory: {
      name: subName,
      nameHe: text(row.subcategoryNameHe),
      code: codeOf(text(row.code)) || letters(subName, 6) || base.subcategory.code,
      photo: base.subcategory.photo,
    },
    properties,
  }
}
