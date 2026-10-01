import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { emptyMarketFilters } from '../../marketFilters'
import { MarketListingsPanel } from './MarketListingsPanel'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ maxWidth: 960, padding: 24 }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Market/MarketListingsPanel',
  component: MarketListingsPanel,
  decorators: [withApp],
}

export const PinnedSpecies = () => (
  <MarketListingsPanel filters={emptyMarketFilters('sp-pothos')} title="In this category" />
)
