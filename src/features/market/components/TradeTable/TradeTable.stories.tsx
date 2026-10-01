import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { classTrades } from '../../../../mock/marketHistory'
import { seedMarketClasses } from '../../../../mock/marketClasses'
import { StoreProvider } from '../../../../mock/store'
import { TradeTable } from './TradeTable'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ maxWidth: 900, padding: 24 }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Market/TradeTable',
  component: TradeTable,
  decorators: [withApp],
}

const mc = seedMarketClasses[0]

export const Default = () => <TradeTable trades={classTrades(mc).map((trade) => ({ ...trade, label: mc.code }))} />

export const Empty = () => <TradeTable trades={[]} />
