import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { classTrades } from '../../../../mock/marketHistory'
import { seedMarketClasses } from '../../../../mock/marketClasses'
import { StoreProvider } from '../../../../mock/store'
import { TradeChart } from './TradeChart'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ maxWidth: 900, padding: 24 }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Market/TradeChart',
  component: TradeChart,
  decorators: [withApp],
}

const pothos = seedMarketClasses.filter((mc) => mc.speciesId === 'sp-pothos')

export const Category = () => (
  <TradeChart trades={pothos.flatMap((mc) => classTrades(mc).map((trade) => ({ ...trade, label: mc.code })))} />
)

export const SingleClass = () => (
  <TradeChart trades={classTrades(pothos[0]).map((trade) => ({ ...trade, label: pothos[0].code }))} height={220} />
)

export const Empty = () => <TradeChart trades={[]} height={180} />
