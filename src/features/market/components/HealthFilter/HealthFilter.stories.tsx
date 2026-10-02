import { useState, type ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { HealthFilter } from './HealthFilter'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ padding: 24 }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Market/HealthFilter',
  component: HealthFilter,
  decorators: [withApp],
}

export const Interactive = () => {
  const [value, setValue] = useState('all')
  return (
    <HealthFilter
      value={value}
      onChange={setValue}
      options={[
        { health: 'S', count: 2 },
        { health: 'A', count: 12 },
        { health: 'B', count: 4 },
        { health: 'C', count: 1 },
        { health: 'D', count: 1 },
      ]}
    />
  )
}
