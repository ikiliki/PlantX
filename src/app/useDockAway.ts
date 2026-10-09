import { useEffect, useState } from 'react'

/** Scroll this far before the dock may tuck away, so a short page never hides it. */
const START = 160
/** Ignore jitter smaller than this. */
const STEP = 8

/**
 * True while the reader scrolls down a long page: the floating dock tucks below the edge to give the
 * content room, and comes back on any scroll up, near the top, or at the very end of the page.
 */
export function useDockAway() {
  const [away, setAway] = useState(false)

  useEffect(() => {
    let last = window.scrollY
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const y = window.scrollY
        const atEnd = window.innerHeight + y >= document.documentElement.scrollHeight - 24
        if (y < START || atEnd) setAway(false)
        else if (y - last > STEP) setAway(true)
        else if (last - y > STEP) setAway(false)
        last = y
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return away
}
