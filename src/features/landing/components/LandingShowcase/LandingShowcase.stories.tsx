import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { LandingShowcase } from './LandingShowcase'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <Story />
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Landing/LandingShowcase',
  component: LandingShowcase,
  decorators: [withApp],
}

export const Wide = () => (
  <div style={{ width: 'min(680px, 100%)' }}>
    <LandingShowcase />
  </div>
)

export const Phone = () => (
  <div style={{ width: 343 }}>
    <LandingShowcase />
  </div>
)
