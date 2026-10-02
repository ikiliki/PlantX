import type { Catalog, Diagnosis } from './types'

const MOCK_DELAY_MS = 500

/** UI-mock answer for Add Plant when no server runs: the first catalog class. */
export function mockDiagnosis(catalog: Catalog): Diagnosis {
  const category = catalog.categories[0]
  const sub = catalog.subcategories.find((item) => item.categoryId === category?.id)
  return {
    provider: 'gemini',
    mode: 'mock',
    label: category?.name ?? '',
    scientificName: category?.name ?? '',
    commonNames: category ? [category.name] : [],
    probability: 0.91,
    isPlant: true,
    draft: category
      ? {
          categoryId: category.id,
          subcategoryId: sub?.id ?? '',
          size: (catalog.properties.find((item) => item.id === 'size')?.options[0]?.id ?? '') as Diagnosis['draft']['size'],
        }
      : {},
    tried: [],
  }
}

export function mockIdentify(catalog: Catalog) {
  return new Promise<Diagnosis>((resolve) => {
    window.setTimeout(() => resolve(mockDiagnosis(catalog)), MOCK_DELAY_MS)
  })
}
