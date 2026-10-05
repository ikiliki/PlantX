import { useNavigate } from 'react-router-dom'
import { AuthPanel } from '../../../auth/components/AuthPanel/AuthPanel'
import { useI18n } from '../../../../i18n/I18nProvider'
import { appHref, siteRole } from '../../../../lib/siteUrls'
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
            <Open to="/greenhouse">{t.landing.openApp}</Open>
          ) : siteRole() === 'landing' ? (
            // Sign-in lives on the app domain only: one Google origin, one session cookie host.
            <Open to={appHref('/login?mode=signup')}>{t.landing.signUp}</Open>
          ) : (
            <AuthPanel
              reason="buy"
              start="register"
              dialog
              titleId="landing-join-title"
              headingLevel="h2"
              onGuest={() => navigate('/greenhouse')}
              onSuccess={() => navigate('/greenhouse')}
            />
          )}
        </Card>
      </Box>
    </Wrap>
  )
}
