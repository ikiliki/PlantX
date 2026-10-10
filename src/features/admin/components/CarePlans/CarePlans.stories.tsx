import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { CarePlans } from './CarePlans'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ padding: 24, maxWidth: 900, background: '#F4F1E8' }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Admin/CarePlans',
  component: CarePlans,
  decorators: [withApp],
}

/** The example catalog: built-in tasks and AI suggestions for every category. */
export const Default = () => <CarePlans />
