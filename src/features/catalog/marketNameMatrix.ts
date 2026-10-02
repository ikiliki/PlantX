import type { Catalog, CatalogProperty, Locale, QualityGrade } from '../../mock/types'
import type { MarketFilterState } from '../market/marketFilters'
import { catalogName, optionLabel, propertyRelevant, subcategoriesFor } from './catalog'

const PROPERTY_ORDER = ['health', 'size', 'stage', 'area']

export type MarketNameColumn = {
  id: string
  label: string
}

export type MarketNameRow = {
  id: string
  speciesId: string
  subcategoryId: string
  category: string
  subcategory: string
  name: string
  code: string
  values: Record<string, string>
  labels: Record<string, string>
}

function orderedProperties(properties: CatalogProperty[]) {
  return [...properties].sort((a, b) => {
    const ai = PROPERTY_ORDER.indexOf(a.id)
    const bi = PROPERTY_ORDER.indexOf(b.id)
    if (ai === -1 && bi === -1) return a.name.localeCompare(b.name)
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
}

function nameProperties(properties: CatalogProperty[]) {
  return orderedProperties(properties.filter((property) => property.inMarketName))
}

function optionCode(id: string) {
  return id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3)
}

function cross(properties: CatalogProperty[]): Record<string, string>[] {
  let rows: Record<string, string>[] = [{}]
  for (const property of properties) {
    if (property.options.length === 0) continue
    const next: Record<string, string>[] = []
    for (const row of rows) {
      for (const option of property.options) next.push({ ...row, [property.id]: option.id })
    }
    rows = next
  }
  return rows
}

export function marketNameColumns(catalog: Catalog, locale: Locale, rows: MarketNameRow[]): MarketNameColumn[] {
  const ids = new Set(rows.flatMap((row) => Object.keys(row.labels)))
  const properties = orderedProperties(catalog.properties.filter((property) => ids.has(property.id)))
  return [
    { id: 'category', label: locale === 'he' ? 'קטגוריה' : 'Category' },
    { id: 'subcategory', label: locale === 'he' ? 'תת־קטגוריה' : 'Subcategory' },
    ...properties.map((property) => ({ id: property.id, label: catalogName(property, locale) })),
    { id: 'name', label: locale === 'he' ? 'שם שוק' : 'Market name' },
  ]
}

export function marketNameRows(catalog: Catalog, locale: Locale): MarketNameRow[] {
  const rows: MarketNameRow[] = []
  for (const category of catalog.categories) {
    const subs = subcategoriesFor(catalog, category.id)
    for (const sub of subs) {
      const relevant = catalog.properties.filter((property) =>
        propertyRelevant(catalog, property, category.id, sub.id),
      )
      const properties = nameProperties(relevant)
      for (const values of cross(properties)) {
        const labels: Record<string, string> = {}
        const nameParts: string[] = [`${catalogName(category, locale)} ${catalogName(sub, locale)}`]
        const codeParts: string[] = [category.ticker, sub.code]
        for (const property of properties) {
          const option = property.options.find((item) => item.id === values[property.id])
          const label = option ? optionLabel(option, locale) : ''
          labels[property.id] = label
          if (!label) continue
          const optionSign = option?.sign || optionCode(option?.id ?? '')
          nameParts.push(optionSign ? `${label} (${optionSign})` : label)
          codeParts.push(optionSign)
        }
        const code = codeParts.filter(Boolean).join('-')
        const name = nameParts.filter(Boolean).join(' · ')
        rows.push({
          id: `${category.id}|${sub.id}|${properties.map((property) => values[property.id] ?? '').join('|')}`,
          speciesId: category.speciesId,
          subcategoryId: sub.id,
          category: catalogName(category, locale),
          subcategory: catalogName(sub, locale),
          name,
          code,
          values,
          labels,
        })
      }
    }
  }
  return rows
}

export function filterMarketNames(rows: MarketNameRow[], filters: MarketFilterState) {
  const query = filters.query.trim().toLowerCase()
  return rows.filter((row) => {
    if (filters.speciesId && row.speciesId !== filters.speciesId) return false
    if (filters.subcategoryIds.length > 0 && !filters.subcategoryIds.includes(row.subcategoryId)) return false
    if (filters.grades.length > 0 && !filters.grades.includes(row.values.health as QualityGrade)) return false
    for (const [propertyId, selected] of Object.entries(filters.traits)) {
      if (selected.length === 0) continue
      if (!selected.includes(row.values[propertyId] ?? '')) return false
    }
    if (!query) return true
    return row.name.toLowerCase().includes(query) || row.code.toLowerCase().includes(query)
  })
}
