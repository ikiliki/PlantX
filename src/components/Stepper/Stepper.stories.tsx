import { useState } from 'react'
import { Stepper } from './Stepper'

export default {
  title: 'Components/Stepper',
  component: Stepper,
}

const steps = [
  { id: 'photo', label: 'Photo' },
  { id: 'identity', label: 'Identity' },
  { id: 'specs', label: 'Specs' },
  { id: 'details', label: 'Details' },
  { id: 'review', label: 'Review' },
]

export const Interactive = () => {
  const [current, setCurrent] = useState(2)
  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 560 }}>
      <Stepper steps={steps} current={current} onStep={setCurrent} ariaLabel="Add plant" />
      <button type="button" onClick={() => setCurrent((value) => Math.min(value + 1, steps.length - 1))}>
        Next
      </button>
    </div>
  )
}

export const First = () => <Stepper steps={steps} current={0} ariaLabel="Add plant" />

export const Narrow = () => (
  <div style={{ width: 320 }}>
    <Stepper steps={steps} current={3} ariaLabel="Add plant" />
  </div>
)

/** Every step reachable; Specs still needs a field. */
export const OpenWithFlag = () => {
  const [current, setCurrent] = useState(4)
  return (
    <div style={{ maxWidth: 560 }}>
      <Stepper steps={steps} current={current} onStep={setCurrent} ariaLabel="Add plant" open flagged={['specs']} flaggedLabel="needs input" />
    </div>
  )
}
