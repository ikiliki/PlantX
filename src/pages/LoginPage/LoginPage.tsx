import { useNavigate } from 'react-router-dom'
import { AuthPanel } from '../../features/auth/components/AuthPanel/AuthPanel'
import { useI18n } from '../../i18n/I18nProvider'
import { Close, Page, Popup } from './LoginPage.styles'

export function LoginPage() {
  const { t } = useI18n()
  const navigate = useNavigate()

  const close = () => {
    if (window.history.length > 1) navigate(-1)
    else navigate('/home')
  }

  return (
    <Page>
      <Popup role="dialog" aria-modal="true" aria-labelledby="login-page-title">
        <Close type="button" onClick={close} aria-label={t.common.cancel}>
          ×
        </Close>
        <AuthPanel
          reason="buy"
          dialog
          titleId="login-page-title"
          onSuccess={() => navigate('/home')}
        />
      </Popup>
    </Page>
  )
}
