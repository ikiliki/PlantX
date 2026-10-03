import { Link } from 'react-router-dom'
import { useI18n } from '../../../../i18n/I18nProvider'
import { appHref } from '../../../../lib/siteUrls'
import { landingShots } from '../../landingShots'
import { DeviceFrame } from '../DeviceFrame/DeviceFrame'
import {
  Actions,
  Desk,
  Hero,
  Kicker,
  LoginLine,
  Mobile,
  Primary,
  Secondary,
  Sub,
  Title,
  Visual,
} from './LandingHero.styles'

export function LandingHero() {
  const { t } = useI18n()

  return (
    <Hero>
      <div>
        <Kicker>{t.landing.kicker}</Kicker>
        <Title>{t.landing.heroTitle}</Title>
        <Sub>{t.landing.heroSub}</Sub>
        <Actions>
          <Primary to={appHref('/login?mode=signup')}>{t.landing.signUp}</Primary>
          <Secondary to={appHref('/greenhouse')}>{t.landing.goToApp}</Secondary>
        </Actions>
        <LoginLine>
          {t.landing.haveAccount}{' '}
          <Link to={appHref('/login')}>{t.landing.logIn}</Link>
        </LoginLine>
      </div>
      <Visual>
        <Desk>
          <DeviceFrame device="desk" src={landingShots.greenhouseDesk} alt={t.landing.tourGreenhouseTitle} eager />
        </Desk>
        <Mobile>
          <DeviceFrame device="phone" src={landingShots.homePhone} alt={t.landing.tourHomeTitle} eager />
        </Mobile>
      </Visual>
    </Hero>
  )
}
