import { catalogSlug } from '../../mock/catalog'
import { defaultPlantPhoto } from '../../mock/images'
import type {
  Catalog,
  CatalogCategory,
  CatalogProperty,
  CatalogPropertyOption,
  CatalogSubcategory,
  CatalogSuggestionDraft,
  Species,
} from '../../mock/types'

export const SYSTEM_PROPERTY_IDS = new Set(['grade', 'size', 'stage'])

function uniqueId(base: string, taken: string[]) {
  if (!taken.includes(base)) return base
  let n = 2
  while (taken.includes(`${base}-${n}`)) n += 1
  return `${base}-${n}`
}

export function parseOptionList(en: string, he: string): CatalogPropertyOption[] {
  const labels = en.split(',').map((item) => item.trim()).filter(Boolean)
  const heLabels = he.split(',').map((item) => item.trim())
  return labels.map((label, index) => ({
    id: catalogSlug(label),
    label,
    labelHe: heLabels[index] || label,
    sign: normalizeSign(label).slice(0, 3) || 'X',
  }))
}

export function upsertCategory(
  catalog: Catalog,
  species: Species[],
  input: { id?: string; name: string; nameHe: string; ticker: string; photo: string },
): { catalog: Catalog; species: Species[] } {
  const ticker = input.ticker.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
  const name = input.name.trim()
  if (!name || !ticker) return { catalog, species }

  const categories = [...catalog.categories]
  const nextSpecies = [...species]
  const existing = input.id ? categories.find((item) => item.id === input.id) : undefined
  const id = existing?.id ?? uniqueId(`cat-${catalogSlug(name)}`, categories.map((item) => item.id))
  const speciesId =
    existing?.speciesId ?? uniqueId(`sp-${catalogSlug(name)}`, nextSpecies.map((item) => item.id))

  const row: CatalogCategory = {
    id,
    speciesId,
    name,
    nameHe: input.nameHe.trim() || name,
    ticker,
    photo: input.photo || defaultPlantPhoto,
  }

  if (existing) {
    const index = categories.findIndex((item) => item.id === id)
    categories[index] = row
  } else {
    if (categories.some((item) => item.ticker === ticker)) return { catalog, species }
    categories.push(row)
    if (!nextSpecies.some((item) => item.id === speciesId)) {
      nextSpecies.push({
        id: speciesId,
        commonName: name,
        commonNameHe: row.nameHe,
        scientificName: name,
        fungibility: 'common',
        ticker,
        rarity: 'common',
        growthTime: { en: '—', he: '—' },
        conditions: {
          light: '—',
          lightHe: '—',
          water: '—',
          waterHe: '—',
          note: 'Added from catalog configuration',
          noteHe: 'נוסף מתצורת הקטלוג',
        },
      })
    }
  }

  const sp = nextSpecies.find((item) => item.id === speciesId)
  if (sp) {
    sp.commonName = name
    sp.commonNameHe = row.nameHe
    sp.ticker = ticker
  }

  return { catalog: { ...catalog, categories }, species: nextSpecies }
}

export function deleteCategory(catalog: Catalog, categoryId: string): Catalog {
  return {
    categories: catalog.categories.filter((item) => item.id !== categoryId),
    subcategories: catalog.subcategories.filter((item) => item.categoryId !== categoryId),
    properties: catalog.properties.map((item) => ({
      ...item,
      categoryIds: item.categoryIds.filter((id) => id !== categoryId),
    })),
  }
}

export function upsertSubcategory(
  catalog: Catalog,
  input: {
    id?: string
    categoryId: string
    name: string
    nameHe: string
    code: string
    photo?: string
  },
): Catalog {
  const code = input.code.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 8)
  const name = input.name.trim()
  if (!input.categoryId || !name || !code) return catalog

  const subcategories = [...catalog.subcategories]
  const existing = input.id ? subcategories.find((item) => item.id === input.id) : undefined
  const id =
    existing?.id ??
    uniqueId(`${input.categoryId}-${catalogSlug(code)}`, subcategories.map((item) => item.id))

  const row: CatalogSubcategory = {
    id,
    categoryId: input.categoryId,
    name,
    nameHe: input.nameHe.trim() || name,
    code,
    photo: input.photo,
  }

  if (existing) {
    const index = subcategories.findIndex((item) => item.id === id)
    subcategories[index] = row
  } else if (subcategories.some((item) => item.categoryId === input.categoryId && item.code === code)) {
    return catalog
  } else {
    subcategories.push(row)
  }

  return { ...catalog, subcategories }
}

export function deleteSubcategory(catalog: Catalog, subcategoryId: string): Catalog {
  return {
    ...catalog,
    subcategories: catalog.subcategories.filter((item) => item.id !== subcategoryId),
    properties: catalog.properties.map((item) => ({
      ...item,
      subcategoryIds: item.subcategoryIds.filter((id) => id !== subcategoryId),
    })),
  }
}

export function normalizeSign(value: string) {
  return value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3)
}

export function signTaken(catalog: Catalog, sign: string, exceptId?: string) {
  if (!sign) return false
  return catalog.properties.some((item) => item.id !== exceptId && item.sign === sign)
}

export function upsertProperty(
  catalog: Catalog,
  input: {
    id?: string
    name: string
    nameHe: string
    required: boolean
    inMarketName: boolean
    sign: string
    categoryIds: string[]
    subcategoryIds: string[]
    options: CatalogPropertyOption[]
  },
): Catalog {
  const name = input.name.trim()
  const sign = input.inMarketName ? normalizeSign(input.sign) : ''
  if (!name || input.options.length === 0) return catalog
  if (input.inMarketName && !/^[A-Z]{1,3}$/.test(sign)) return catalog
  if (signTaken(catalog, sign, input.id)) return catalog

  const properties = [...catalog.properties]
  const existing = input.id ? properties.find((item) => item.id === input.id) : undefined
  const id = existing?.id ?? uniqueId(catalogSlug(name), properties.map((item) => item.id))

  const row: CatalogProperty = {
    id,
    name,
    nameHe: input.nameHe.trim() || name,
    required: input.required,
    inMarketName: input.inMarketName,
    sign,
    categoryIds: input.categoryIds,
    subcategoryIds: input.subcategoryIds,
    options: input.options.map((option) => ({
      ...option,
      sign: normalizeSign(option.sign),
    })),
  }

  if (existing) {
    const index = properties.findIndex((item) => item.id === id)
    properties[index] = row
  } else {
    properties.push(row)
  }

  return { ...catalog, properties }
}

export function deleteProperty(catalog: Catalog, propertyId: string): Catalog {
  if (SYSTEM_PROPERTY_IDS.has(propertyId)) return catalog
  return {
    ...catalog,
    properties: catalog.properties.filter((item) => item.id !== propertyId),
  }
}

function optionId(label: string, sign: string, taken: string[]) {
  const base = catalogSlug(label) || sign.toLowerCase() || 'opt'
  return uniqueId(base, taken)
}

/** Create the category, its subcategory, and the proposed properties. Returns null when a ticker or sign is taken. */
export function applyCatalogSuggestion(
  catalog: Catalog,
  species: Species[],
  draft: CatalogSuggestionDraft,
): { catalog: Catalog; species: Species[] } | null {
  const ticker = draft.category.ticker.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
  const name = draft.category.name.trim()
  const subName = draft.subcategory.name.trim()
  const code = draft.subcategory.code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 8)
  if (!name || !ticker || !subName || !code) return null
  if (catalog.categories.some((item) => item.ticker === ticker)) return null
  const usedSigns = new Set<string>()
  for (const prop of draft.properties) {
    if (!prop.inMarketName) continue
    const sign = normalizeSign(prop.sign)
    if (!sign || usedSigns.has(sign) || signTaken(catalog, sign)) return null
    usedSigns.add(sign)
  }

  const stepped = upsertCategory(catalog, species, {
    name,
    nameHe: draft.category.nameHe,
    ticker,
    photo: draft.category.photo,
  })
  const category = stepped.catalog.categories.find((item) => item.ticker === ticker)
  if (!category) return null

  let next = upsertSubcategory(stepped.catalog, {
    categoryId: category.id,
    name: subName,
    nameHe: draft.subcategory.nameHe,
    code,
    photo: draft.subcategory.photo,
  })
  const sub = next.subcategories.find((item) => item.categoryId === category.id && item.code === code)

  for (const prop of draft.properties) {
    const taken: string[] = []
    const options = prop.options
      .map((option) => {
        const label = option.label.trim()
        const sign = normalizeSign(option.sign)
        if (!label || !sign) return undefined
        const id = optionId(label, sign, taken)
        taken.push(id)
        return { id, label, labelHe: option.labelHe.trim() || label, sign }
      })
      .filter((option): option is CatalogPropertyOption => Boolean(option))
    if (!prop.name.trim() || options.length === 0) continue
    const onSub = prop.scope === 'subcategory' && sub
    next = upsertProperty(next, {
      name: prop.name,
      nameHe: prop.nameHe,
      required: prop.required,
      inMarketName: prop.inMarketName,
      sign: prop.sign,
      categoryIds: onSub ? [] : [category.id],
      subcategoryIds: onSub ? [sub.id] : [],
      options,
    })
  }

  return { catalog: next, species: stepped.species }
}

export function propertiesForCategory(catalog: Catalog, categoryId: string) {
  return catalog.properties.filter((item) => item.categoryIds.includes(categoryId))
}

export function propertiesForSubcategory(catalog: Catalog, subcategoryId: string) {
  return catalog.properties.filter((item) => item.subcategoryIds.includes(subcategoryId))
}
