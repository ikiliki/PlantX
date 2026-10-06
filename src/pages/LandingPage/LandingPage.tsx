import { useEffect } from 'react'
import { ScrollTopButton } from '../../components/ScrollTopButton/ScrollTopButton'
import { LandingAi } from '../../features/landing/components/LandingAi/LandingAi'
import { LandingHero } from '../../features/landing/components/LandingHero/LandingHero'
import { LandingJoin } from '../../features/landing/components/LandingJoin/LandingJoin'
import { LandingNav } from '../../features/landing/components/LandingNav/LandingNav'
import { LandingProof } from '../../features/landing/components/LandingProof/LandingProof'
import { LandingSoon } from '../../features/landing/components/LandingSoon/LandingSoon'
import { LandingTour } from '../../features/landing/components/LandingTour/LandingTour'
import { PRIVACY_PATH, TERMS_PATH } from '../../features/legal/legalPaths'
import { useI18n } from '../../i18n/I18nProvider'
import { appHref } from '../../lib/siteUrls'
import { track } from '../../lib/track'
import { Foot, FootLinks, Main, Page } from './LandingPage.styles'

export function LandingPage() {
  const { t } = useI18n()

  useEffect(() => {
    track('landing_view', {}, { once: true })
  }, [])

  return (
    <Page>
      <LandingNav />
      <Main>
        <LandingHero />
        <LandingProof />
        <LandingAi />
        <LandingTour />
        <LandingSoon />
        <LandingJoin />
        <Foot>
          <span>{t.landing.footerCopy}</span>
          <span>{t.landing.footerNote}</span>
          <FootLinks>
            <a href={appHref(PRIVACY_PATH)}>{t.legal.privacy}</a>
            <a href={appHref(TERMS_PATH)}>{t.legal.terms}</a>
          </FootLinks>
        </Foot>
      </Main>
      <ScrollTopButton label={t.common.backToTop} />
    </Page>
  )
}
