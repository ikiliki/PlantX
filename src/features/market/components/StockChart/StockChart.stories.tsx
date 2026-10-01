import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { averageHistory, classHistory } from '../../../../mock/marketHistory'
import { seedMarketClasses } from '../../../../mock/marketClasses'
import { StoreProvider } from '../../../../mock/store'
import { StockChart } from './StockChart'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ maxWidth: 820, padding: 24 }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Market/StockChart',
  component: StockChart,
  decorators: [withApp],
}

const pothos = seedMarketClasses[0]
const monstera = seedMarketClasses.find((mc) => mc.speciesId === 'sp-monstera') ?? pothos

export const Month = () => <StockChart points={classHistory(pothos)} />

export const Year = () => <StockChart points={classHistory(monstera)} defaultRange="1Y" />

export const CategoryAverage = () => (
  <StockChart
    label="Category average"
    points={averageHistory(seedMarketClasses.filter((mc) => mc.speciesId === 'sp-pothos'))}
    defaultRange="3M"
    height={260}
  />
)
