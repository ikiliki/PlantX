import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { AuthPanel } from './AuthPanel'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Auth/AuthPanel',
  component: AuthPanel,
  decorators: [withApp],
}

export const Page = () => <AuthPanel onSuccess={() => undefined} />

export const Dialog = () => (
  <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 16, background: '#F4F1E8' }}>
    <AuthPanel dialog onSuccess={() => undefined} />
  </div>
)

export const Gate = () => (
  <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 16, background: '#F4F1E8' }}>
    <AuthPanel dialog gate onSuccess={() => undefined} onContinue={() => undefined} />
  </div>
)

export const Register = () => <AuthPanel start="register" reason="sell" onSuccess={() => undefined} />

export const GoogleOnly = () => (
  <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 16, background: '#F4F1E8' }}>
    <AuthPanel ssoOnly dialog onSuccess={() => undefined} />
  </div>
)
