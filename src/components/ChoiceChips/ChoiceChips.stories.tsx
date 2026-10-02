import { useState } from 'react'
import { ChoiceChips } from './ChoiceChips'

export default {
  title: 'Components/ChoiceChips',
  component: ChoiceChips,
}

const healthLetters = [
  { id: 'S', label: 'S', hint: 'Best condition' },
  { id: 'A', label: 'A', hint: 'Healthy' },
  { id: 'B', label: 'B', hint: 'Small marks' },
  { id: 'C', label: 'C', hint: 'Needs care' },
  { id: 'D', label: 'D', hint: 'Low condition' },
]

export const Chips = () => {
  const [value, setValue] = useState('')
  return <ChoiceChips label="Health" required options={healthLetters} value={value} onChange={setValue} />
}

export const Suggested = () => {
  const [value, setValue] = useState('B')
  return (
    <ChoiceChips
      label="Health"
      required
      options={healthLetters}
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
  <ChoiceChips label="Health" disabled options={healthLetters} value="" onChange={() => undefined} />
)

export const Waiting = () => (
  <ChoiceChips label="Subcategory" required disabled options={[]} value="" onChange={() => undefined} />
)

export const ShowMore = () => {
  const [value, setValue] = useState('pothos')
  const [open, setOpen] = useState(false)
  const options = [
    { id: 'pothos', label: 'Pothos' },
    { id: 'monstera', label: 'Monstera' },
    { id: 'snake', label: 'Snake plant' },
    { id: 'peace', label: 'Peace lily' },
    { id: 'spider', label: 'Spider plant' },
    { id: 'zz', label: 'ZZ plant' },
    { id: 'other', label: 'Other' },
  ]
  const shown = open ? options : [...options.slice(0, 3), options[options.length - 1]]
  return (
    <ChoiceChips
      label="Category"
      required
      options={shown}
      value={value}
      onChange={setValue}
      more={{
        label: open ? 'Show less' : `Show more (${options.length - shown.length})`,
        onMore: () => setOpen((current) => !current),
      }}
    />
  )
}
