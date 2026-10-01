import { ScrollTopButton } from '../../components/ScrollTopButton/ScrollTopButton'
import { LandingAccess } from '../../features/landing/components/LandingAccess/LandingAccess'
import { LandingHero } from '../../features/landing/components/LandingHero/LandingHero'
import { LandingHow } from '../../features/landing/components/LandingHow/LandingHow'
import { LandingNav } from '../../features/landing/components/LandingNav/LandingNav'
import { LandingProduct } from '../../features/landing/components/LandingProduct/LandingProduct'
import { LandingProof } from '../../features/landing/components/LandingProof/LandingProof'
import { useI18n } from '../../i18n/I18nProvider'
import { Foot, Page } from './LandingPage.styles'

export function LandingPage() {
  const { t } = useI18n()

  return (
    <Page>
      <LandingNav />
      <LandingHero />
      <LandingProof />
      <LandingHow />
      <LandingProduct />
      <LandingAccess />
      <Foot>
        <span>{t.landing.footerCopy}</span>
        <span>{t.landing.footerNote}</span>
      </Foot>
      <ScrollTopButton label={t.common.backToTop} />
    </Page>
  )
}
