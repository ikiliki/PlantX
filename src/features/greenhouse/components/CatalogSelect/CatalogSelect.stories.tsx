import type { ReactNode } from 'react'
import { useState } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { CatalogSelect } from './CatalogSelect'

const withApp = (Story: () => ReactNode) => (
  <I18nProvider>
    <div style={{ padding: 24, maxWidth: 320 }}>
      <Story />
    </div>
  </I18nProvider>
)

export default {
  title: 'Features/Greenhouse/CatalogSelect',
  component: CatalogSelect,
  decorators: [withApp],
}

const OPTIONS = [
  { id: 'a', label: 'Category A' },
  { id: 'b', label: 'Category B' },
  { id: 'c', label: 'Category C' },
]

export const Default = () => {
  const [value, setValue] = useState('')
  return (
    <CatalogSelect
      label="Category"
      value={value}
      onChange={setValue}
      options={OPTIONS}
      chooseLabel="Choose"
      required
    />
  )
}

export const Disabled = () => (
  <CatalogSelect
    label="Subcategory"
    value=""
    onChange={() => undefined}
    options={OPTIONS}
    chooseLabel="Choose"
    disabled
  />
)
