import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { LandingAi } from './LandingAi'

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
  title: 'Features/Landing/LandingAi',
  component: LandingAi,
  decorators: [withApp],
}

export const Steps = () => <LandingAi />
