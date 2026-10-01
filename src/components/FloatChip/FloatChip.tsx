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

const DRAG_THRESHOLD = 8

/** Mobile-only floating chip: fixed while scrolling, draggable, tap opens a sheet. */
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
    moved: boolean
  } | null>(null)
  const chipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    pointRef.current = point
  }, [point])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
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

  const onPointerDown = (event: ReactPointerEvent) => {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: pointRef.current,
      moved: false,
    }
    setDragging(true)
  }

  const onPointerMove = (event: ReactPointerEvent) => {
    const state = drag.current
    if (!state || state.pointerId !== event.pointerId) return
    const dx = event.clientX - state.startX
    const dy = event.clientY - state.startY
    if (!state.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
    state.moved = true
    const next = clamp({ x: state.origin.x + dx, y: state.origin.y + dy })
    pointRef.current = next
    setPoint(next)
  }

  const endDrag = (event: ReactPointerEvent) => {
    const state = drag.current
    if (!state || state.pointerId !== event.pointerId) return
    drag.current = null
    setDragging(false)
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      /* ignore */
    }
    if (state.moved) {
      writePoint(posKey, pointRef.current)
      return
    }
    setOpen(true)
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
