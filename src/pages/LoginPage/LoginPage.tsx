import { useNavigate, useSearchParams } from 'react-router-dom'
import { HoldStage } from '../../components/HoldStage/HoldStage'
import { AuthPanel } from '../../features/auth/components/AuthPanel/AuthPanel'
import { Popup, Stack } from './LoginPage.styles'

/** Only same-site paths, so a crafted link cannot send a signed-in user elsewhere. */
function safeNext(next: string | null) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/greenhouse'
}

/** Log in and sign up (`?mode=signup`). The product header is absent, including when the API is down. */
export function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))

  return (
    <HoldStage open mode="login">
      <Stack>
        <Popup role="dialog" aria-modal="true" aria-labelledby="login-page-title">
          <AuthPanel
            reason="buy"
            start={params.get('mode') === 'signup' ? 'register' : 'login'}
            dialog
            titleId="login-page-title"
            onSuccess={() => navigate(next, { replace: true })}
          />
        </Popup>
      </Stack>
    </HoldStage>
  )
}
