import { useState, type ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { GradeFilter } from './GradeFilter'

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
  title: 'Features/Market/GradeFilter',
  component: GradeFilter,
  decorators: [withApp],
}

export const Interactive = () => {
  const [value, setValue] = useState('all')
  return (
    <GradeFilter
      value={value}
      onChange={setValue}
      options={[
        { grade: 'A', count: 12 },
        { grade: 'B', count: 4 },
        { grade: 'C', count: 1 },
      ]}
    />
  )
}
