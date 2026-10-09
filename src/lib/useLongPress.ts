import { useEffect, useRef, type MouseEvent, type PointerEvent } from 'react'

/** The platform's usual long-press length. */
export const LONG_PRESS_MS = 500
/** A finger that travels this far is scrolling or dragging, not pressing. */
const SLOP = 10

/**
 * Long-press on a link or button: after `LONG_PRESS_MS` without moving, `onLong` runs (with a short buzz) and the
 * click that the release would send is swallowed, so the link does not navigate. A normal tap is untouched.
 * `bind(onLong)` returns the handlers for one element; one press is tracked at a time.
 */
export function useLongPress() {
  const press = useRef<{ timer: number; x: number; y: number; fired: boolean } | null>(null)
  const swallowClick = useRef(false)

  useEffect(() => () => window.clearTimeout(press.current?.timer), [])

  const cancel = () => {
    if (press.current) window.clearTimeout(press.current.timer)
    press.current = null
  }

  return (onLong: () => void) => ({
    onPointerDown: (event: PointerEvent) => {
      if (event.button !== 0) return
      cancel()
      swallowClick.current = false
      const state = {
        x: event.clientX,
        y: event.clientY,
        fired: false,
        timer: window.setTimeout(() => {
          state.fired = true
          swallowClick.current = true
          navigator.vibrate?.(12)
          onLong()
        }, LONG_PRESS_MS),
      }
      press.current = state
    },
    onPointerMove: (event: PointerEvent) => {
      const state = press.current
      if (state && !state.fired && Math.hypot(event.clientX - state.x, event.clientY - state.y) > SLOP) cancel()
    },
    onPointerUp: cancel,
    onPointerCancel: cancel,
    onPointerLeave: cancel,
    onClick: (event: MouseEvent) => {
      if (!swallowClick.current) return
      swallowClick.current = false
      event.preventDefault()
      event.stopPropagation()
    },
    // The phone's own long-press menu (copy link, preview) would cover ours.
    onContextMenu: (event: MouseEvent) => event.preventDefault(),
  })
}
