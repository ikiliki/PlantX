import { useSyncExternalStore } from 'react'

/** Scroll this far before the dock may tuck away, so a short page never hides it. */
const START = 160
/** Ignore jitter smaller than this. */
const STEP = 8

let away = false
let last = 0
let frame = 0
const listeners = new Set<() => void>()

function set(next: boolean) {
  if (next === away) return
  away = next
  listeners.forEach((listener) => listener())
}

/**
 * The phone dock tucks below the edge while the reader scrolls down a long page, and stays tucked at the end
 * of the page. It comes back on any scroll up, near the top, or from the back-to-top button (`showDock`).
 */
function onScroll() {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    const y = window.scrollY
    if (y < START) set(false)
    else if (y - last > STEP) set(true)
    else if (last - y > STEP) set(false)
    last = y
  })
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) {
    last = window.scrollY
    window.addEventListener('scroll', onScroll, { passive: true })
  }
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }
}

/** True while the dock is tucked away. */
export function useDockAway() {
  return useSyncExternalStore(subscribe, () => away, () => false)
}

/** Bring the dock back (the back-to-top button does this as it scrolls up). */
export function showDock() {
  set(false)
}
