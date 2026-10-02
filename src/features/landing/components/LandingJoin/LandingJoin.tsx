import { useNavigate } from 'react-router-dom'
import { AuthPanel } from '../../../auth/components/AuthPanel/AuthPanel'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { Body, Box, Card, Kicker, Open, Title, Wrap } from './LandingJoin.styles'

/** Sign up / log in at the end of the landing. Same Google card as /login. */
export function LandingJoin() {
  const { t } = useI18n()
  const { signedIn } = useStore()
  const navigate = useNavigate()

  return (
    <Wrap id="join">
      <Box>
        <div>
          <Kicker>{t.landing.joinKicker}</Kicker>
          <Title>{t.landing.joinTitle}</Title>
          <Body>{t.landing.joinBody}</Body>
        </div>
        <Card>
          {signedIn ? (
            <Open to="/home">{t.landing.openApp}</Open>
          ) : (
            <AuthPanel
              reason="buy"
              start="register"
              dialog
              titleId="landing-join-title"
              onSuccess={() => navigate('/home')}
            />
          )}
        </Card>
      </Box>
    </Wrap>
  )
}
