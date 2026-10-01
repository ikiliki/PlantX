import { ScrollTopButton } from '../../components/ScrollTopButton/ScrollTopButton'
import { LandingHero } from '../../features/landing/components/LandingHero/LandingHero'
import { LandingHow } from '../../features/landing/components/LandingHow/LandingHow'
import { LandingNav } from '../../features/landing/components/LandingNav/LandingNav'
import { LandingScreens } from '../../features/landing/components/LandingScreens/LandingScreens'
import { useI18n } from '../../i18n/I18nProvider'
import { Foot, HowWrap, Page } from './LandingPage.styles'

export function LandingPage() {
  const { t } = useI18n()

  return (
    <Page>
      <LandingNav />
      <LandingHero />
      <HowWrap>
        <LandingHow />
      </HowWrap>
      <LandingScreens />
      <Foot>{t.landing.footer}</Foot>
      <ScrollTopButton label={t.common.backToTop} />
    </Page>
  )
}
