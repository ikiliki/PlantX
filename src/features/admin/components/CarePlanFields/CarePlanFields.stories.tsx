import { useState, type ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import type { CarePlan } from '../../../../mock/types'
import { CarePlanFields } from './CarePlanFields'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ padding: 24, maxWidth: 560, background: '#FFFFFF' }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Admin/CarePlanFields',
  component: CarePlanFields,
  decorators: [withApp],
}

export const AllDefault = () => {
  const [plan, setPlan] = useState<CarePlan | undefined>()
  return <CarePlanFields value={plan} onChange={setPlan} />
}

export const Custom = () => {
  const [plan, setPlan] = useState<CarePlan | undefined>({
    water: { everyDays: 10, winterEveryDays: 18 },
    rotate: { everyDays: 14 },
    repot: null,
  })
  return <CarePlanFields value={plan} onChange={setPlan} />
}
