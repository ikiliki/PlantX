import { Icon } from '../../../../components/Icon/Icon'
import { useI18n } from '../../../../i18n/I18nProvider'
import { appHref } from '../../../../lib/siteUrls'
import { LandingShowcase } from '../LandingShowcase/LandingShowcase'
import { Actions, Hero, Primary, Secondary, Sub, Title, Visual } from './LandingHero.styles'

export function LandingHero() {
  const { t } = useI18n()

  return (
    <Hero>
      <div>
        <Title>{t.landing.heroTitle}</Title>
        <Sub>{t.landing.heroSub}</Sub>
        <Actions>
          <Primary to={appHref('/greenhouse')}>
            {t.landing.startGreenhouse}
            <Icon name="arrowUp" size={18} />
          </Primary>
          <Secondary href="#tour">{t.landing.heroSeeHow}</Secondary>
        </Actions>
      </div>
      <Visual>
        <LandingShowcase />
      </Visual>
    </Hero>
  )
}
