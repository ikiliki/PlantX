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
    title="Log in to see your greenhouse"
    body="Your plants, level and care live in your account. Until then, enjoy the catalog."
    action="Log in"
  />
)

export const Card = () => (
  <GuestView
    card
    title="Log in to see what's growing"
    body="The feed shows what growers water, photograph and add."
    action="Log in"
  />
)

export const WithTryAction = () => (
  <GuestView
    title="Log in to see your greenhouse"
    body="Your plants, level and care live in your account. Until then, enjoy the catalog."
    action="Log in"
    secondary={{ label: 'Try adding a plant', onClick: () => undefined }}
  />
)
