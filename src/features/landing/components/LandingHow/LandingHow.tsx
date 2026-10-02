import { useI18n } from '../../../../i18n/I18nProvider'
import { LandingStill, type LandingStillId } from '../../../../pages/LandingStills/LandingStills'
import { Band, Head, Index, Kicker, Lead, Photo, Step, Steps, Title } from './LandingHow.styles'

const frames: LandingStillId[] = ['plant', 'track', 'list', 'buy']

export function LandingHow() {
  const { t } = useI18n()
  const steps = [
    { title: t.landing.how1Title, body: t.landing.how1Body },
    { title: t.landing.how2Title, body: t.landing.how2Body },
    { title: t.landing.how3Title, body: t.landing.how3Body },
    { title: t.landing.how4Title, body: t.landing.how4Body },
  ]

  return (
    <Band id="how">
      <Head>
        <div>
          <Kicker>{t.landing.howEyebrow}</Kicker>
          <Title>{t.landing.howTitle}</Title>
        </div>
        <Lead>{t.landing.howLead}</Lead>
      </Head>
      <Steps>
        {steps.map((step, index) => (
          <Step key={step.title}>
            <Photo>
              <LandingStill id={frames[index]} />
            </Photo>
            <Index>{String(index + 1).padStart(2, '0')}</Index>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </Step>
        ))}
      </Steps>
    </Band>
  )
}
