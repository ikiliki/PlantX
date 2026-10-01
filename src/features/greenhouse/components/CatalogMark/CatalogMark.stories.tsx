import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider, useStore } from '../../../../mock/store'
import { CatalogMark, PlantCatalogMark } from './CatalogMark'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ padding: 24, maxWidth: 360 }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/CatalogMark',
  component: CatalogMark,
  decorators: [withApp],
}

const PHOTO = '/class-photos/mon-std-a-l-mat.jpg'

export const Icon = () => <CatalogMark photo={PHOTO} name="Monstera deliciosa" />

export const WithLabel = () => <CatalogMark photo={PHOTO} name="Monstera deliciosa" label="Category photo" />

export const Large = () => <CatalogMark photo={PHOTO} name="Monstera deliciosa" size={32} />

export const Rtl = () => (
  <div dir="rtl">
    <CatalogMark photo={PHOTO} name="מונסטרה" label="תמונת קטגוריה" />
  </div>
)

export const NoPhoto = () => <CatalogMark name="Nothing renders" />

export const FromPlant = () => {
  const { db } = useStore()
  const plant = db.plants[0]
  return plant ? <PlantCatalogMark plant={plant} /> : null
}
