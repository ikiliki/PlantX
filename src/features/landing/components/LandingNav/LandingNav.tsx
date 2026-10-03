import { useEffect, useState } from 'react'
import { canChooseLocale } from '../../../../i18n/locales'
import { useI18n } from '../../../../i18n/I18nProvider'
import { appHref, landingHref } from '../../../../lib/siteUrls'
import { useStore } from '../../../../mock/store'
import { Actions, Bar, Brand, BrandMark, Enter, Jump, Lang, LangBtn, Links } from './LandingNav.styles'

export function LandingNav() {
  const { t, locale } = useI18n()
  const { setLocale } = useStore()
  const [solid, setSolid] = useState(false)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <Bar $solid={solid} data-solid={solid ? 'true' : 'false'}>
      <Brand to={landingHref()}>
        <BrandMark src="/icons/brand-mark.svg" alt="" width={30} height={30} $solid={solid} />
        {t.appName}
      </Brand>
      <Links>
        <Jump href="#ai">{t.landing.navAi}</Jump>
        <Jump href="#tour">{t.landing.navTour}</Jump>
      </Links>
      <Actions>
        {canChooseLocale() && (
          <Lang>
            <LangBtn
              type="button"
              $on={locale === 'he'}
              $solid={solid}
              aria-pressed={locale === 'he'}
              onClick={() => setLocale('he')}
            >
              {t.landing.langHe}
            </LangBtn>
            <LangBtn
              type="button"
              $on={locale === 'en'}
              $solid={solid}
              aria-pressed={locale === 'en'}
              onClick={() => setLocale('en')}
            >
              {t.landing.langEn}
            </LangBtn>
          </Lang>
        )}
        <Enter to={appHref('/greenhouse')}>{t.landing.goToApp}</Enter>
      </Actions>
    </Bar>
  )
}
