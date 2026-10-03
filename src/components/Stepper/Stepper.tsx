import type { CSSProperties } from 'react'
import { Dot, Fill, Item, Label, Root, Track } from './Stepper.styles'

export type StepperStep = {
  id: string
  label: string
}

/**
 * Wizard progress. Steps before `current` are done and can be revisited.
 * `open` makes every step reachable. `flagged` step ids still need something and show a warning dot.
 */
export function Stepper({
  steps,
  current,
  onStep,
  ariaLabel,
  open = false,
  flagged = [],
  flaggedLabel,
}: {
  steps: StepperStep[]
  current: number
  onStep?: (index: number) => void
  ariaLabel: string
  open?: boolean
  flagged?: string[]
  /** Read after a flagged step's name, e.g. "needs input". */
  flaggedLabel?: string
}) {
  const progress = steps.length > 1 ? current / (steps.length - 1) : 1
  return (
    <Root aria-label={ariaLabel} style={{ '--steps': steps.length } as CSSProperties}>
      <Track aria-hidden>
        <Fill style={{ transform: `scaleX(${progress})` }} />
      </Track>
      {steps.map((step, index) => {
        const state = index < current ? 'done' : index === current ? 'current' : 'next'
        const reachable = Boolean(onStep) && index !== current && (open || index < current)
        const warn = flagged.includes(step.id)
        return (
          <Item
            key={step.id}
            type="button"
            $state={state}
            disabled={!reachable}
            aria-current={state === 'current' ? 'step' : undefined}
            aria-label={warn && flaggedLabel ? `${step.label}, ${flaggedLabel}` : undefined}
            onClick={() => reachable && onStep?.(index)}
          >
            <Dot $state={state} $warn={warn}>
              {warn ? '!' : state === 'done' ? '✓' : index + 1}
            </Dot>
            <Label $state={state} $warn={warn}>
              {step.label}
            </Label>
          </Item>
        )
      })}
    </Root>
  )
}
