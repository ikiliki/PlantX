import { useEffect, useState } from 'react'
import { showDock, useDockAway } from '../../app/dockState'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { Icon } from '../Icon/Icon'
import { Fab } from './ScrollTopButton.styles'

/**
 * Back to the top once the page is scrolled down. `side` keeps it clear of other floating buttons.
 * `dock` (the app shell's button): on a phone it takes the dock's place at the bottom centre while the dock
 * is tucked away; tapping it scrolls up and brings the dock back. Without `dock` it stays off on a phone.
 */
export function ScrollTopButton({
  label,
  threshold = 900,
  side = 'end',
  dock = false,
}: {
  label: string
  threshold?: number
  side?: 'start' | 'end'
  dock?: boolean
}) {
  const [scrolled, setScrolled] = useState(false)
  const phone = useMediaQuery('(max-width: 899px)')
  const dockAway = useDockAway()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  if (phone && !dock) return null
  const visible = phone ? dockAway : scrolled

  return (
    <Fab
      type="button"
      aria-label={label}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      $visible={visible}
      $side={side}
      $docked={phone}
      onClick={() => {
        showDock()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
    >
      <Icon name="arrowUp" size={20} />
    </Fab>
  )
}
