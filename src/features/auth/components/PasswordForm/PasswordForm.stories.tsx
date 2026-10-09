import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { PasswordForm } from './PasswordForm'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ maxWidth: 320, padding: 24, background: '#1F3B2D', color: '#F4F1E8' }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Auth/PasswordForm',
  component: PasswordForm,
  decorators: [withApp],
}

export const Login = () => <PasswordForm mode="login" agreed onSuccess={() => undefined} onPending={() => undefined} />

export const Register = () => (
  <PasswordForm mode="register" agreed onSuccess={() => undefined} onPending={() => undefined} />
)

export const NotAgreed = () => (
  <PasswordForm mode="login" agreed={false} onSuccess={() => undefined} onPending={() => undefined} />
)
