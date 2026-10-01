import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { MarketPeekCard, MarketPeekDialog } from './MarketPeek'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ padding: 24 }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Market/MarketPeek',
  component: MarketPeekCard,
  decorators: [withApp],
}

export const Card = () => <MarketPeekCard classId="mc-pot-gold-a-m-r" />

export const Popup = () => (
  <MarketPeekDialog classId="mc-pot-gold-a-m-r" speciesId="sp-pothos" onClose={() => undefined} />
)
