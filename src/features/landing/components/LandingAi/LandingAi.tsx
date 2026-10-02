import { useEffect, useState } from 'react'
import { useI18n } from '../../../../i18n/I18nProvider'
import { landingShots } from '../../landingShots'
import { Band, Head, Kicker, Lead, Shot, Stage, Step, StepBody, StepIndex, Steps, Title } from './LandingAi.styles'

const SHOTS = [landingShots.aiPhoto, landingShots.aiScan, landingShots.aiIdentity, landingShots.aiReview]
const ADVANCE_MS = 4200

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/** Add Plant's AI steps, shown with stills of the real wizard. Steps advance on their own until picked. */
export function LandingAi() {
  const { t } = useI18n()
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(() => !prefersReducedMotion())
  const steps = [
    { title: t.landing.ai1Title, body: t.landing.ai1Body },
    { title: t.landing.ai2Title, body: t.landing.ai2Body },
    { title: t.landing.ai3Title, body: t.landing.ai3Body },
    { title: t.landing.ai4Title, body: t.landing.ai4Body },
  ]

  useEffect(() => {
    if (!auto) return
    const timer = window.setInterval(() => setActive((i) => (i + 1) % SHOTS.length), ADVANCE_MS)
    return () => window.clearInterval(timer)
  }, [auto])

  const pick = (index: number) => {
    setAuto(false)
    setActive(index)
  }

  return (
    <Band id="ai">
      <Head>
        <Kicker>{t.landing.aiKicker}</Kicker>
        <Title>{t.landing.aiTitle}</Title>
        <Lead>{t.landing.aiLead}</Lead>
      </Head>
      <Stage>
        <Steps role="tablist" aria-orientation="vertical" aria-label={t.landing.aiKicker}>
          {steps.map((step, index) => (
            <Step
              key={step.title}
              type="button"
              role="tab"
              id={`ai-step-${index}`}
              aria-selected={active === index}
              aria-controls="ai-step-shot"
              $on={active === index}
              $auto={auto && active === index}
              onClick={() => pick(index)}
            >
              <StepIndex>{t.landing.aiStep.replace('{n}', String(index + 1))}</StepIndex>
              <strong>{step.title}</strong>
              <StepBody>{step.body}</StepBody>
            </Step>
          ))}
        </Steps>
        <Shot id="ai-step-shot" role="tabpanel" aria-labelledby={`ai-step-${active}`}>
          {SHOTS.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={index === active ? steps[index].title : ''}
              aria-hidden={index !== active}
              data-on={index === active ? 'true' : 'false'}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          ))}
        </Shot>
      </Stage>
    </Band>
  )
}
