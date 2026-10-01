import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Root } from './Reveal.styles'

type Props = {
  children: ReactNode
  /** Position in a list; staggers the entrance of neighbours that appear together. */
  index?: number
  as?: 'div' | 'li' | 'section' | 'article'
  className?: string
}

export function Reveal({ children, index = 0, as = 'div', className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setShown(true)
        observer.disconnect()
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <Root ref={ref} as={as} className={className} $shown={shown} $delay={Math.min(index % 8, 7) * 45}>
      {children}
    </Root>
  )
}
