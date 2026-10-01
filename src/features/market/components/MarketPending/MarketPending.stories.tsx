import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { MarketPending } from './MarketPending'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ padding: 24, maxWidth: 1100 }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Market/MarketPending',
  component: MarketPending,
  decorators: [withApp],
}

export const Page = () => <MarketPending />

export const Widget = () => (
  <div style={{ maxWidth: 360 }}>
    <MarketPending view="widget" />
  </div>
)
