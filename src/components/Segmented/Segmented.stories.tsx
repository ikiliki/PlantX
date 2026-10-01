import { useState } from 'react'
import { Segmented } from './Segmented'

export default {
  title: 'Components/Segmented',
  component: Segmented,
}

export const TwoOptions = () => {
  const [value, setValue] = useState<'mock' | 'live'>('mock')
  return (
    <Segmented
      ariaLabel="Mode"
      value={value}
      onChange={setValue}
      options={[
        { id: 'mock', label: 'Mock' },
        { id: 'live', label: 'Live' },
      ]}
    />
  )
}

export const ThreeOptions = () => {
  const [value, setValue] = useState<'all' | 'mock' | 'live'>('all')
  return (
    <Segmented
      ariaLabel="Filter"
      value={value}
      onChange={setValue}
      options={[
        { id: 'all', label: 'All' },
        { id: 'mock', label: 'Mock' },
        { id: 'live', label: 'Live' },
      ]}
    />
  )
}

export const Disabled = () => (
  <Segmented
    ariaLabel="Mode"
    value="live"
    disabled
    onChange={() => undefined}
    options={[
      { id: 'mock', label: 'Mock' },
      { id: 'live', label: 'Live' },
    ]}
  />
)
