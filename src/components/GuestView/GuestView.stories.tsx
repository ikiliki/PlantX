import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../features/auth/AuthProvider'
import { I18nProvider } from '../../i18n/I18nProvider'
import { StoreProvider } from '../../mock/store'
import { GuestView } from './GuestView'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <AuthProvider>
          <Story />
        </AuthProvider>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Components/GuestView',
  component: GuestView,
  decorators: [withApp],
}

export const Greenhouse = () => (
  <GuestView
    title="Sign in to open your greenhouse"
    body="A guest can browse the market and the wiki. Your plants stay behind an account."
    action="Log in or register"
  />
)
