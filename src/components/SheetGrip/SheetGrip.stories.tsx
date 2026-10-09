import { useState } from 'react'
import { SheetGrip, useSheetDrag } from './SheetGrip'

function Frame() {
  const [open, setOpen] = useState(true)
  const sheet = useSheetDrag(() => setOpen(false))
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
    )
  }
  return (
    <div
      ref={sheet.bind}
      style={{
        position: 'relative',
        width: 320,
        height: 280,
        borderRadius: 22,
        background: '#E5F3FB',
        boxShadow: '0 18px 44px color-mix(in srgb, var(--c-ink) 14%, transparent)',
      }}
    >
      <SheetGrip label="Drag down to close" shown {...sheet.grip} />
      <p style={{ margin: '48px 20px 0', fontFamily: 'Georgia, serif', fontSize: 22 }}>Pull the pill down.</p>
    </div>
  )
}

export default {
  title: 'Components/SheetGrip',
  component: SheetGrip,
}

export const Draggable = () => (
  <div style={{ padding: 24, background: '#173128', minHeight: 360 }}>
    <Frame />
  </div>
)
