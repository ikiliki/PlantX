import { seasonalCareFor } from '../../mock/seasonalCare'
import { SeasonalCare } from './SeasonalCare'

export default {
  title: 'Components/SeasonalCare',
  component: SeasonalCare,
}

const pothos = seasonalCareFor('sp-pothos')!

export const Spring = () => (
  <div style={{ maxWidth: 480 }}>
    <SeasonalCare care={pothos} initialSeason="spring" />
  </div>
)

export const NarrowWithFooter = () => (
  <div style={{ maxWidth: 320 }}>
    <SeasonalCare
      care={seasonalCareFor('sp-monstera')!}
      initialSeason="autumn"
      footer={
        <span>
          <strong>Growth time:</strong> 3–5 years
        </span>
      }
    />
  </div>
)
