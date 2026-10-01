import { useEffect, type ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../../auth/AuthProvider'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider, useStore } from '../../../../mock/store'
import { GreenhouseLure } from './GreenhouseLure'

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
      <AuthProvider>
        <MemoryRouter>
          <div style={{ width: 250 }}>
            <Story />
          </div>
        </MemoryRouter>
      </AuthProvider>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Discover/GreenhouseLure',
  component: GreenhouseLure,
  decorators: [withApp],
}

export const Empty = () => (
  <SignedIn id="u-ari">
    <GreenhouseLure />
  </SignedIn>
)

export const Rail = () => (
  <SignedIn id="u-maya">
    <GreenhouseLure />
  </SignedIn>
)

export const CompactMobile = () => (
  <SignedIn id="u-maya">
    <div style={{ width: 360 }}>
      <GreenhouseLure compact />
    </div>
  </SignedIn>
)
