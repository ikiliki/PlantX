import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { GreenhouseLure } from './GreenhouseLure'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ width: 250 }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Discover/GreenhouseLure',
  component: GreenhouseLure,
  decorators: [withApp],
}

export const Rail = () => <GreenhouseLure />

export const CompactMobile = () => (
  <div style={{ width: 360 }}>
    <GreenhouseLure compact />
  </div>
)
