import { useI18n } from '../../../../i18n/I18nProvider'
import { Body, Check, Checks, Desk, Devices, Feature, Kicker, Phone, Phones, Section, Title } from './LandingProduct.styles'

export function LandingProduct() {
  const { t } = useI18n()
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
        <Devices>
          <Desk>
            <img src="/landing/greenhouse-desk.png" alt="" />
          </Desk>
          <Phones>
            <Phone>
              <img src="/landing/greenhouse-phone.png" alt="" />
            </Phone>
            <Phone>
              <img src="/landing/home-phone.png" alt="" />
            </Phone>
          </Phones>
        </Devices>
      </Feature>
    </Section>
  )
}
