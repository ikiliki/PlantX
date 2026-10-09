import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../../i18n/I18nProvider'
import { Backdrop, Chip, Face, Sheet, SheetBody, SheetClose, SheetTitle } from './FloatChip.styles'
import { useDialogLayer } from '../../lib/dialogLayer'

type Point = { x: number; y: number }

function readPoint(key: string, fallback: Point): Point {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Point
    if (typeof parsed.x !== 'number' || typeof parsed.y !== 'number') return fallback
    return parsed
  } catch {
    return fallback
  }
}

function writePoint(key: string, point: Point) {
  try {
    sessionStorage.setItem(key, JSON.stringify(point))
  } catch {
    /* ignore */
  }
}

/** A finger that travels this far before the hold arms is scrolling the page, not pressing the chip. */
const DRAG_THRESHOLD = 8
/** Hold this long to pick the chip up and drag it. */
const HOLD_MS = 350

/**
 * Mobile-only floating chip, fixed while scrolling. A tap opens its sheet; a hold picks it up (it lifts and the
 * phone buzzes) and then it follows the finger. Moving before the hold scrolls the page as usual.
 */
export function FloatChip({
  id,
  label,
  face,
  children,
  defaultPoint,
  sheetTitle,
}: {
  id: string
  label: string
  face: ReactNode
  children: ReactNode
  /** Distance from the top-left of the viewport. */
  defaultPoint: Point
  /** Optional heading inside the sheet. Defaults to `label`. Pass empty string to hide. */
  sheetTitle?: string
}) {
  const { t } = useI18n()
  const posKey = `plantx-float-pos:${id}`
  const [open, setOpen] = useState(false)
  const [point, setPoint] = useState(() => readPoint(posKey, defaultPoint))
  const [dragging, setDragging] = useState(false)
  const pointRef = useRef(point)
  const drag = useRef<{
    pointerId: number
    startX: number
    startY: number
    origin: Point
    /** The hold has passed: the chip is picked up and follows the finger. */
    armed: boolean
    moved: boolean
    timer: number
  } | null>(null)
  const chipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    pointRef.current = point
  }, [point])

  // A layer: the page behind stays put, and back closes it.
  useDialogLayer(() => setOpen(false), { enabled: open })
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const clamp = useCallback((next: Point): Point => {
    const el = chipRef.current
    const w = el?.offsetWidth ?? 72
    const h = el?.offsetHeight ?? 72
    const maxX = Math.max(8, window.innerWidth - w - 8)
    const maxY = Math.max(8, window.innerHeight - h - 8)
    return {
      x: Math.min(maxX, Math.max(8, next.x)),
      y: Math.min(maxY, Math.max(8, next.y)),
    }
  }, [])

  useLayoutEffect(() => {
    const fit = () => {
      const next = clamp(pointRef.current)
      if (next.x === pointRef.current.x && next.y === pointRef.current.y) return
      pointRef.current = next
      setPoint(next)
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [clamp])

  // While the chip is picked up, a touch drag must move the chip, not scroll the page.
  useEffect(() => {
    const el = chipRef.current
    if (!el) return
    const onTouchMove = (event: TouchEvent) => {
      if (drag.current?.armed) event.preventDefault()
    }
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => el.removeEventListener('touchmove', onTouchMove)
  }, [])

  useEffect(() => () => window.clearTimeout(drag.current?.timer), [])

  const onPointerDown = (event: ReactPointerEvent) => {
    if (event.button !== 0) return
    const pointerId = event.pointerId
    const target = event.currentTarget
    drag.current = {
      pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: pointRef.current,
      armed: false,
      moved: false,
      timer: window.setTimeout(() => {
        const state = drag.current
        if (!state || state.pointerId !== pointerId) return
        state.armed = true
        setDragging(true)
        try {
          target.setPointerCapture(pointerId)
        } catch {
          /* ignore */
        }
        navigator.vibrate?.(12)
      }, HOLD_MS),
    }
  }

  const onPointerMove = (event: ReactPointerEvent) => {
    const state = drag.current
    if (!state || state.pointerId !== event.pointerId) return
    const dx = event.clientX - state.startX
    const dy = event.clientY - state.startY
    if (!state.armed) {
      // Moving before the hold: the finger is scrolling the page. Let it, and forget the press.
      if (Math.hypot(dx, dy) >= DRAG_THRESHOLD) {
        window.clearTimeout(state.timer)
        drag.current = null
      }
      return
    }
    state.moved = true
    const next = clamp({ x: state.origin.x + dx, y: state.origin.y + dy })
    pointRef.current = next
    setPoint(next)
  }

  const endDrag = (event: ReactPointerEvent) => {
    const state = drag.current
    if (!state || state.pointerId !== event.pointerId) return
    window.clearTimeout(state.timer)
    drag.current = null
    setDragging(false)
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      /* ignore */
    }
    if (state.armed) {
      // Picked up: a drag saves the new spot; a hold without moving just puts it back down.
      if (state.moved) writePoint(posKey, pointRef.current)
      return
    }
    // A tap (released before the hold) opens the sheet. A cancelled touch (the page scrolled) does not.
    if (event.type === 'pointerup') setOpen(true)
  }

  return createPortal(
    <>
      <Chip
        ref={chipRef}
        $dragging={dragging}
        style={{ left: point.x, top: point.y }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <Face type="button" aria-label={label} aria-haspopup="dialog" aria-expanded={open}>
          {face}
        </Face>
      </Chip>
      {open
        ? createPortal(
            <Backdrop role="presentation" onClick={() => setOpen(false)}>
              <Sheet
                role="dialog"
                aria-modal="true"
                aria-label={label}
                onClick={(event) => event.stopPropagation()}
              >
                <SheetClose type="button" aria-label={t.common.cancel} onClick={() => setOpen(false)}>
                  ×
                </SheetClose>
                {sheetTitle !== '' ? <SheetTitle>{sheetTitle ?? label}</SheetTitle> : null}
                <SheetBody>{children}</SheetBody>
              </Sheet>
            </Backdrop>,
            document.body,
          )
        : null}
    </>,
    document.body,
  )
}
