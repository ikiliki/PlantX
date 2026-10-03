import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { LandingSoon } from './LandingSoon'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ containerType: 'inline-size', containerName: 'landing' }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Landing/LandingSoon',
  component: LandingSoon,
  decorators: [withApp],
}

export const ComingSoon = () => <LandingSoon />
