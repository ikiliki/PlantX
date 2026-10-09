import { useSyncExternalStore } from 'react'
import { palettes, type GardenMode } from './tokens'

/** The grower's choice; nothing stored means "follow the device". `index.html` reads it before first paint. */
const KEY = 'plantx.garden'

const listeners = new Set<() => void>()
const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)')

function storedChoice(): GardenMode | null {
  try {
    const value = localStorage.getItem(KEY)
    return value === 'day' || value === 'night' ? value : null
  } catch {
    return null
  }
}

/** The garden on screen: the stored choice, else the device's light or dark setting. */
export function currentGarden(): GardenMode {
  return storedChoice() ?? (darkQuery().matches ? 'night' : 'day')
}

/** The phone status bar and browser chrome take the page colour of the garden on screen. */
function paintChrome(mode: GardenMode) {
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', palettes[mode].colors.cream)
}

function apply(mode: GardenMode) {
  try {
    localStorage.setItem(KEY, mode)
  } catch {
    // Private windows can refuse storage; the garden still switches for this visit.
  }
  document.documentElement.dataset.theme = mode
  paintChrome(mode)
  listeners.forEach((listener) => listener())
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { ready: Promise<void> }
}

/**
 * Switch gardens. With `from` (the toggle's centre) the new garden spreads out from there in a circle;
 * browsers without view transitions, and reduced motion, switch at once.
 */
export function setGarden(mode: GardenMode, from?: { x: number; y: number }) {
  const doc = document as ViewTransitionDocument
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!from || reduced || !doc.startViewTransition) {
    apply(mode)
    return
  }
  const radius = Math.hypot(Math.max(from.x, innerWidth - from.x), Math.max(from.y, innerHeight - from.y))
  const transition = doc.startViewTransition(() => apply(mode))
  transition.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${from.x}px ${from.y}px)`, `circle(${radius}px at ${from.x}px ${from.y}px)`],
        },
        { duration: 700, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' },
      )
    })
    .catch(() => undefined)
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const query = darkQuery()
  const onDevice = () => {
    if (storedChoice()) return
    paintChrome(currentGarden())
    listener()
  }
  query.addEventListener('change', onDevice)
  return () => {
    listeners.delete(listener)
    query.removeEventListener('change', onDevice)
  }
}

/** The garden on screen, re-rendering when the grower switches or the device changes. */
export function useGarden(): GardenMode {
  return useSyncExternalStore(subscribe, currentGarden, () => 'day')
}
