import { ScrollTopButton } from '../../components/ScrollTopButton/ScrollTopButton'
import { LandingAi } from '../../features/landing/components/LandingAi/LandingAi'
import { LandingHero } from '../../features/landing/components/LandingHero/LandingHero'
import { LandingJoin } from '../../features/landing/components/LandingJoin/LandingJoin'
import { LandingNav } from '../../features/landing/components/LandingNav/LandingNav'
import { LandingProof } from '../../features/landing/components/LandingProof/LandingProof'
import { LandingTour } from '../../features/landing/components/LandingTour/LandingTour'
import { useI18n } from '../../i18n/I18nProvider'
import { Foot, Main, Page } from './LandingPage.styles'

export function LandingPage() {
  const { t } = useI18n()

  return (
    <Page>
      <LandingNav />
      <Main>
        <LandingHero />
        <LandingProof />
        <LandingAi />
        <LandingTour />
        <LandingJoin />
        <Foot>
          <span>{t.landing.footerCopy}</span>
          <span>{t.landing.footerNote}</span>
        </Foot>
      </Main>
      <ScrollTopButton label={t.common.backToTop} />
    </Page>
  )
}
