import { useRef, type PointerEvent } from 'react'
import { theme } from '../../theme/tokens'
import { Grip } from './SheetGrip.styles'

const CLOSE_DISTANCE = 96
const FLICK = 0.55

type Drag = {
  startY: number
  lastY: number
  lastT: number
  velocity: number
}

/** Phone sheets are 75% tall. This grip follows a downward drag and closes the sheet. */
export function useSheetDrag(onClose: () => void) {
  const sheetRef = useRef<HTMLElement | null>(null)
  const drag = useRef<Drag | null>(null)
  const closing = useRef(false)

  const bind = (node: HTMLElement | null) => {
    sheetRef.current = node
  }

  const phone = () => window.matchMedia(`(max-width: ${theme.breakpoints.sm})`).matches

  const moveTo = (dy: number, animate: boolean) => {
    const sheet = sheetRef.current
    if (!sheet) return
    sheet.style.animation = 'none'
    sheet.style.transition = animate
      ? `transform 320ms ${theme.motion.spring}`
      : 'none'
    sheet.style.transform = `translate3d(0, ${dy}px, 0)`
  }

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (!phone() || closing.current) return
    drag.current = {
      startY: event.clientY,
      lastY: event.clientY,
      lastT: performance.now(),
      velocity: 0,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    moveTo(0, false)
  }

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const current = drag.current
    if (!current) return
    const now = performance.now()
    const dt = Math.max(1, now - current.lastT)
    current.velocity = (event.clientY - current.lastY) / dt
    current.lastY = event.clientY
    current.lastT = now
    moveTo(Math.max(0, event.clientY - current.startY), false)
  }

  const finish = (event: PointerEvent<HTMLElement>) => {
    const current = drag.current
    drag.current = null
    if (!current || closing.current) return
    const dy = Math.max(0, event.clientY - current.startY)
    const flick = dy > 28 && current.velocity > FLICK
    if (dy > CLOSE_DISTANCE || flick) {
      closing.current = true
      const sheet = sheetRef.current
      if (!sheet) {
        onClose()
        return
      }
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) {
        onClose()
        return
      }
      sheet.style.animation = 'none'
      sheet.style.transition = `transform 220ms ${theme.motion.exit}`
      sheet.style.transform = 'translate3d(0, 110%, 0)'
      window.setTimeout(onClose, 200)
      return
    }
    moveTo(0, true)
  }

  return {
    bind,
    grip: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finish,
      onPointerCancel: finish,
    },
  }
}

export function SheetGrip({
  label,
  shown,
  ...grip
}: {
  label: string
  /** Story frames keep the pill visible on a wide canvas. */
  shown?: boolean
} & ReturnType<typeof useSheetDrag>['grip']) {
  return <Grip $shown={shown} role="button" aria-label={label} {...grip} />
}
