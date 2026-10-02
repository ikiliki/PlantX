import { useEffect, useState } from 'react'
import { Icon } from '../Icon/Icon'
import { Fab } from './ScrollTopButton.styles'

/** Back to the top once the page is scrolled down. `side` keeps it clear of other floating buttons. */
export function ScrollTopButton({
  label,
  threshold = 900,
  side = 'end',
}: {
  label: string
  threshold?: number
  side?: 'start' | 'end'
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return (
    <Fab
      type="button"
      aria-label={label}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      $visible={visible}
      $side={side}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <Icon name="arrowUp" size={20} />
    </Fab>
  )
}
