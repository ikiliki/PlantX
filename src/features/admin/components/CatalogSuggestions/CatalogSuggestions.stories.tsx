import { useState, type ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import type { CatalogSuggestion } from '../../../../mock/types'
import { CatalogSuggestions } from './CatalogSuggestions'

const sample: CatalogSuggestion[] = [
  {
    id: 'sug-ficus',
    createdAt: '2026-10-01T12:00:00.000Z',
    name: 'Fiddle-leaf fig',
    scientificName: 'Ficus lyrata',
    genus: 'Ficus',
    commonNames: ['Fiddle-leaf fig'],
    provider: 'plantnet',
    hits: 3,
  },
]

const withI18n = (Story: () => ReactNode) => (
  <I18nProvider>
    <Story />
  </I18nProvider>
)

export default {
  title: 'Features/Admin/CatalogSuggestions',
  component: CatalogSuggestions,
  decorators: [withI18n],
}

export const Open = () => {
  const [rows, setRows] = useState(sample)
  return (
    <CatalogSuggestions
      items={rows}
      onAdd={() => undefined}
      onDismiss={(id) => setRows((current) => current.filter((row) => row.id !== id))}
    />
  )
}
