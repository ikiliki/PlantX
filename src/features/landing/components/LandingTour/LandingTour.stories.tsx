import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { LandingTour } from './LandingTour'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ containerType: 'inline-size', containerName: 'landing', background: '#F4F1E8' }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Landing/LandingTour',
  component: LandingTour,
  decorators: [withApp],
}

export const Tour = () => <LandingTour />
