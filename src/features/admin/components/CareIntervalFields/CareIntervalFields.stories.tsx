import { useState, type ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import type { CareRule } from '../../../../mock/types'
import { CareIntervalFields } from './CareIntervalFields'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ padding: 24, maxWidth: 480, background: '#FFFFFF' }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Admin/CareIntervalFields',
  component: CareIntervalFields,
  decorators: [withApp],
}

export const NoDefault = () => {
  const [value, setValue] = useState<CareRule | undefined>()
  return <CareIntervalFields value={value} onChange={setValue} offLabel="No default (owners set it)" />
}

export const Seasonal = () => {
  const [value, setValue] = useState<CareRule | undefined>({ everyDays: 30, months: [3, 4, 5, 6, 7, 8, 9] })
  return <CareIntervalFields value={value} onChange={setValue} offLabel="Use the task default" />
}
