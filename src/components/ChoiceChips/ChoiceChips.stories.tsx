import { useState } from 'react'
import { ChoiceChips } from './ChoiceChips'

export default {
  title: 'Components/ChoiceChips',
  component: ChoiceChips,
}

const grades = [
  { id: 'A', label: 'A', hint: 'Show quality' },
  { id: 'B', label: 'B', hint: 'Healthy' },
  { id: 'C', label: 'C', hint: 'Needs care' },
]

export const Chips = () => {
  const [value, setValue] = useState('')
  return <ChoiceChips label="Grade" required options={grades} value={value} onChange={setValue} />
}

export const Suggested = () => {
  const [value, setValue] = useState('B')
  return (
    <ChoiceChips
      label="Grade"
      required
      options={grades}
      value={value}
      onChange={setValue}
      suggestedId="B"
      suggestedLabel="✦ AI"
    />
  )
}

const tile = (label: string, color: string) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect fill="${color}" width="160" height="120"/><text x="50%" y="55%" text-anchor="middle" font-size="14" fill="#123C2D">${label}</text></svg>`,
  )

export const Tiles = () => {
  const [value, setValue] = useState('monstera')
  return (
    <div style={{ maxWidth: 520 }}>
      <ChoiceChips
        label="Category"
        layout="tiles"
        required
        value={value}
        onChange={setValue}
        suggestedId="monstera"
        suggestedLabel="✦ AI"
        options={[
          { id: 'monstera', label: 'Monstera', photo: tile('Monstera', '#E4EBD8') },
          { id: 'philodendron', label: 'Philodendron', photo: tile('Philo', '#CFEA78') },
          { id: 'anthurium', label: 'Anthurium', photo: tile('Anthurium', '#F2C8A7') },
        ]}
      />
    </div>
  )
}

export const Disabled = () => (
  <ChoiceChips label="Size" disabled options={grades} value="" onChange={() => undefined} />
)
