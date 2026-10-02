import { useRef } from 'react'
import { PillMenu } from './PillMenu'

export default {
  title: 'Features/Market/PillMenu',
  component: PillMenu,
}

function Choices() {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <button type="button">S</button>
      <button type="button">M</button>
      <button type="button">L</button>
    </div>
  )
}

export const Dropdown = () => {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div style={{ position: 'relative', height: 160, padding: 16 }}>
      <PillMenu phone={false} sheetRef={ref}>
        <Choices />
      </PillMenu>
    </div>
  )
}

export const PhoneSheet = () => {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <PillMenu phone sheetRef={ref} label="Size">
      <Choices />
    </PillMenu>
  )
}
