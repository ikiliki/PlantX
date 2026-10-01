import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { AddPlantCard } from './AddPlantCard'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ padding: 24, background: '#F4F1E8', containerType: 'inline-size' }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/AddPlantCard',
  component: AddPlantCard,
  decorators: [withApp],
}

export const Tile = () => (
  <div style={{ maxWidth: 240 }}>
    <AddPlantCard onClick={() => undefined} />
  </div>
)

export const Hero = () => (
  <div style={{ display: 'grid', maxWidth: 900 }}>
    <AddPlantCard hero onClick={() => undefined} />
  </div>
)
