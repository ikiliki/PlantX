import { useEffect, useRef, useState } from 'react'
import { isLayerOpen } from '../../lib/dialogLayer'
import { Arrow, Indicator, Spinner } from './PullToRefresh.styles'

/** How far the finger travels (after damping) before a release refreshes. */
const TRIGGER = 64
const MAX = 96

/**
 * Phone pull-to-refresh for a page that scrolls the window. Pull down at the very top: an arrow
 * follows the finger and turns once a release would refresh, then a spinner shows until `onRefresh`
 * settles. While mounted it turns off the browser's own pull-to-reload so the page is not reloaded.
 */
export function PullToRefresh({
  enabled,
  busy,
  label,
  onRefresh,
}: {
  enabled: boolean
  busy: boolean
  label: string
  onRefresh: () => void
}) {
  const [pull, setPull] = useState(0)
  const start = useRef<number | null>(null)
  const pullRef = useRef(0)

  useEffect(() => {
    if (!enabled) return
    const root = document.documentElement
    const previous = root.style.overscrollBehaviorY
    root.style.overscrollBehaviorY = 'contain'

    const onStart = (event: TouchEvent) => {
      // A pull inside a popup scrolls the popup; it never refreshes the page underneath.
      const target = event.target as Element | null
      if (isLayerOpen() || target?.closest?.('[role="dialog"], [aria-modal="true"], [role="menu"]')) {
        start.current = null
        return
      }
      start.current = window.scrollY <= 0 ? event.touches[0].clientY : null
    }
    const onMove = (event: TouchEvent) => {
      if (start.current == null) return
      const delta = event.touches[0].clientY - start.current
      const next = delta > 0 && window.scrollY <= 0 ? Math.min(delta * 0.5, MAX) : 0
      pullRef.current = next
      setPull(next)
    }
    const onEnd = () => {
      if (start.current != null && pullRef.current >= TRIGGER) onRefresh()
      start.current = null
      pullRef.current = 0
      setPull(0)
    }
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onEnd)
    window.addEventListener('touchcancel', onEnd)
    return () => {
      root.style.overscrollBehaviorY = previous
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
      window.removeEventListener('touchcancel', onEnd)
    }
  }, [enabled, onRefresh])

  if (!enabled) return null
  const shown = busy ? 56 : pull
  return (
    <Indicator role="status" aria-live="polite" aria-label={busy ? label : undefined} style={{ height: shown }} $settling={pull === 0}>
      {busy ? <Spinner aria-hidden /> : <Arrow aria-hidden $ready={pull >= TRIGGER} style={{ opacity: Math.min(pull / TRIGGER, 1) }} />}
    </Indicator>
  )
}
