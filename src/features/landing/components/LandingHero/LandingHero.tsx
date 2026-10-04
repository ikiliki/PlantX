import { Link } from 'react-router-dom'
import { useI18n } from '../../../../i18n/I18nProvider'
import { appHref } from '../../../../lib/siteUrls'
import { LandingShowcase } from '../LandingShowcase/LandingShowcase'
import { Actions, Hero, Kicker, LoginLine, Primary, Secondary, Sub, Title, Visual } from './LandingHero.styles'

export function LandingHero() {
  const { t } = useI18n()

  return (
    <Hero>
      <div>
        <Kicker>{t.landing.kicker}</Kicker>
        <Title>{t.landing.heroTitle}</Title>
        <Sub>{t.landing.heroSub}</Sub>
        <Actions>
          <Primary to={appHref('/greenhouse')}>{t.landing.startGreenhouse}</Primary>
          <Secondary href="#tour">{t.landing.heroSeeHow}</Secondary>
        </Actions>
        <LoginLine>
          {t.landing.guestLead}{' '}
          <Link to={appHref('/login')}>{t.landing.logIn}</Link> {t.landing.guestTail}
        </LoginLine>
      </div>
      <Visual>
        <LandingShowcase />
      </Visual>
    </Hero>
  )
}
