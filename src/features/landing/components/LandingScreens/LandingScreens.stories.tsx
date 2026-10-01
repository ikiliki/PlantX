import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { SellProvider } from '../../../sell/SellProvider'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { LandingScreens } from './LandingScreens'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <SellProvider>
          <Story />
        </SellProvider>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Landing/LandingScreens',
  component: LandingScreens,
  decorators: [withApp],
}

export const Default = () => <LandingScreens />
