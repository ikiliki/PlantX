import type { CSSProperties } from 'react'
import { Dot, Fill, Item, Label, Root, Track } from './Stepper.styles'

export type StepperStep = {
  id: string
  label: string
}

/** Wizard progress. Steps before `current` are done and can be revisited. */
export function Stepper({
  steps,
  current,
  onStep,
  ariaLabel,
}: {
  steps: StepperStep[]
  current: number
  onStep?: (index: number) => void
  ariaLabel: string
}) {
  const progress = steps.length > 1 ? current / (steps.length - 1) : 1
  return (
    <Root aria-label={ariaLabel} style={{ '--steps': steps.length } as CSSProperties}>
      <Track aria-hidden>
        <Fill style={{ transform: `scaleX(${progress})` }} />
      </Track>
      {steps.map((step, index) => {
        const state = index < current ? 'done' : index === current ? 'current' : 'next'
        const reachable = Boolean(onStep) && index < current
        return (
          <Item
            key={step.id}
            type="button"
            $state={state}
            disabled={!reachable}
            aria-current={state === 'current' ? 'step' : undefined}
            onClick={() => reachable && onStep?.(index)}
          >
            <Dot $state={state}>{state === 'done' ? '✓' : index + 1}</Dot>
            <Label $state={state}>{step.label}</Label>
          </Item>
        )
      })}
    </Root>
  )
}
