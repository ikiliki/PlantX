import { useEffect, type ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../features/auth/AuthProvider'
import { SellProvider } from '../../features/sell/SellProvider'
import { I18nProvider } from '../../i18n/I18nProvider'
import { useStore, StoreProvider } from '../../mock/store'
import { ProfilePage } from './ProfilePage'

function SignedIn({ id, children }: { id: string; children: ReactNode }) {
  const { loginAs } = useStore()
  useEffect(() => {
    loginAs(id)
  }, [id, loginAs])
  return children
}

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <AuthProvider>
          <SellProvider>
            <Story />
          </SellProvider>
        </AuthProvider>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Pages/ProfilePage',
  component: ProfilePage,
  decorators: [withApp],
}

export const Guest = () => <ProfilePage />

export const Grower = () => (
  <SignedIn id="u-maya">
    <ProfilePage />
  </SignedIn>
)

export const Widget = () => (
  <SignedIn id="u-maya">
    <div style={{ maxWidth: 420 }}>
      <ProfilePage view="widget" />
    </div>
  </SignedIn>
)

export const Summary = () => (
  <div style={{ maxWidth: 330, minHeight: 480 }}>
    <ProfilePage view="widget" userId="u-gal" />
  </div>
)
