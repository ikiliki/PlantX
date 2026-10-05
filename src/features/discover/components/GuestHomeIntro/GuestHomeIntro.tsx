import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../../components/Button/Button'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useMediaQuery } from '../../../../lib/useMediaQuery'
import { useAuth } from '../../../auth/AuthProvider'
import {
  Actions,
  AiChip,
  CareChip,
  Copy,
  Eyebrow,
  Frame,
  Lead,
  Note,
  Pause,
  Photo,
  Progress,
  Root,
  ScanLine,
  ScanText,
  Stage,
  StageTag,
  Step,
  StepBody,
  StepButton,
  StepNumber,
  Steps,
  StepTitle,
  Title,
} from './GuestHomeIntro.styles'

/** How long each step stays before the next one, while it plays. */
export const GUEST_INTRO_STEP_MS = 3400
const STEP_COUNT = 3
const EXAMPLE_PHOTO = '/class-photos/pot-gold-a-xl-mat.jpg'

/**
 * Signed-out Home: a short explainer instead of a blurred feed (#47).
 * Three steps (photo → AI suggests → care) play on a looping example; tap a step to hold it.
 * Nothing here is fetched, and nothing is saved: Try adding a plant opens Add Plant on the greenhouse.
 */
export function GuestHomeIntro({ startStep = 0, autoplay = true }: { startStep?: number; autoplay?: boolean }) {
  const { t } = useI18n()
  const { openAuth } = useAuth()
  const navigate = useNavigate()
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [active, setActive] = useState(startStep)
  const [playing, setPlaying] = useState(autoplay)
  const moving = playing && !reduced

  useEffect(() => {
    if (!moving) return
    const id = window.setTimeout(() => setActive((step) => (step + 1) % STEP_COUNT), GUEST_INTRO_STEP_MS)
    return () => window.clearTimeout(id)
  }, [moving, active])

  const steps = [
    { title: t.guest.introStep1Title, body: t.guest.introStep1Body },
    { title: t.guest.introStep2Title, body: t.guest.introStep2Body },
    { title: t.guest.introStep3Title, body: t.guest.introStep3Body },
  ]

  const pick = (index: number) => {
    setActive(index)
    setPlaying(false)
  }

  return (
    <Root aria-labelledby="guest-intro-title">
      <Copy>
        <Eyebrow>{t.guest.introEyebrow}</Eyebrow>
        <Title id="guest-intro-title">{t.guest.introTitle}</Title>
        <Lead>{t.guest.introLead}</Lead>

        <Steps>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepButton type="button" $on={active === index} aria-current={active === index ? 'step' : undefined} onClick={() => pick(index)}>
                <StepNumber $on={active === index} aria-hidden="true">
                  {index + 1}
                </StepNumber>
                <span>
                  <StepTitle>{step.title}</StepTitle>
                  <StepBody>{step.body}</StepBody>
                </span>
                {active === index && moving ? <Progress key={`${index}-${active}`} $ms={GUEST_INTRO_STEP_MS} aria-hidden="true" /> : null}
              </StepButton>
            </Step>
          ))}
        </Steps>

        <Actions>
          <Button type="button" variant="growth" onClick={() => navigate('/greenhouse?add=1')}>
            {t.guest.tryAddPlant}
          </Button>
          <Button type="button" variant="ghost" onClick={() => openAuth('buy')}>
            {t.guest.logIn}
          </Button>
        </Actions>
        <Note>{t.guest.introNote}</Note>
      </Copy>

      <Stage data-step={active}>
        <Frame role="img" aria-label={t.guest.introStageLabel}>
          <Photo src={EXAMPLE_PHOTO} alt="" width={480} height={480} loading="lazy" />
          <StageTag aria-hidden="true">{t.guest.introExample}</StageTag>
          <ScanLine $on={active === 0} aria-hidden="true" />
          <ScanText $on={active === 0} aria-hidden="true">
            {t.guest.introStageScan}
          </ScanText>
          <AiChip $on={active === 1} aria-hidden="true">
            <small>✦ {t.guest.introStageAi}</small>
            <b>{t.guest.introStageAiName}</b>
          </AiChip>
          <CareChip $on={active === 2} aria-hidden="true">
            <span className="drop" />
            <b>{t.guest.introStageCare}</b>
          </CareChip>
        </Frame>
        {reduced ? null : (
          <Pause type="button" onClick={() => setPlaying((on) => !on)} aria-pressed={!playing}>
            {playing ? t.guest.introPause : t.guest.introPlay}
          </Pause>
        )}
      </Stage>
    </Root>
  )
}
