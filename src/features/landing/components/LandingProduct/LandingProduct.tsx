import { useI18n } from '../../../../i18n/I18nProvider'
import { LandingStill } from '../../../../pages/LandingStills/LandingStills'
import { Body, Check, Checks, Feature, Kicker, Section, Still, Title } from './LandingProduct.styles'

export function LandingProduct() {
  const { t, locale } = useI18n()
  const checks = [t.landing.check1, t.landing.check2, t.landing.check3]

  return (
    <Section id="product">
      <Feature>
        <div>
          <Kicker>{t.landing.pillarsEyebrow}</Kicker>
          <Title>{t.landing.productTitle}</Title>
          <Body>{t.landing.productBody}</Body>
          <Checks>
            {checks.map((line) => (
              <Check key={line}>
                <i>✓</i>
                <span>{line}</span>
              </Check>
            ))}
          </Checks>
        </div>
        <Still>
          <LandingStill id="greenhouse" locale={locale} />
        </Still>
      </Feature>
    </Section>
  )
}
