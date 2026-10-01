import { useNavigate } from 'react-router-dom'
import { HoldStage } from '../../components/HoldStage/HoldStage'
import { AuthPanel } from '../../features/auth/components/AuthPanel/AuthPanel'
import { useI18n } from '../../i18n/I18nProvider'
import { formatApiFailure } from '../../lib/apiFailure'
import { useStore } from '../../mock/store'
import { Note, Popup, Stack } from './LoginPage.styles'

/** Same hold as admin sign-in. The product header is absent, including when the API is down. */
export function LoginPage() {
  const { t } = useI18n()
  const { liveStatus, liveFailure } = useStore()
  const navigate = useNavigate()
  const note =
    liveStatus === 'down'
      ? formatApiFailure(liveFailure, t.admin)
      : liveStatus === 'loading'
        ? t.admin.serverLoadingBody
        : ''

  return (
    <HoldStage open mode="login">
      <Stack>
        {note ? <Note>{note}</Note> : null}
        <Popup role="dialog" aria-modal="true" aria-labelledby="login-page-title">
          <AuthPanel
            reason="buy"
            dialog
            titleId="login-page-title"
            onSuccess={() => navigate('/home')}
          />
        </Popup>
      </Stack>
    </HoldStage>
  )
}
