import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { LandingJoin } from './LandingJoin'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ containerType: 'inline-size', containerName: 'landing', background: '#F4F1E8', paddingTop: 24 }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Landing/LandingJoin',
  component: LandingJoin,
  decorators: [withApp],
}

export const SignUp = () => <LandingJoin />
