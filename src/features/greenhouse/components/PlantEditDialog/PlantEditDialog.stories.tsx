import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider, useStore } from '../../../../mock/store'
import { PlantEditDialog } from './PlantEditDialog'

function FirstPlant() {
  const { db } = useStore()
  const plant = db.plants[0]
  return plant ? <PlantEditDialog plant={plant} onClose={() => undefined} /> : null
}

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <Story />
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/PlantEditDialog',
  component: PlantEditDialog,
  decorators: [withApp],
}

export const Default = () => <FirstPlant />
