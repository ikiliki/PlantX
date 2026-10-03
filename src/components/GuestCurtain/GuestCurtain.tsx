import type { ReactNode } from 'react'
import { Behind, Front, Wrap } from './GuestCurtain.styles'

/**
 * A screen's placeholder layout (skeleton cards, never fetched data). With a `card` (the guest view)
 * the placeholder is blurred and inert and the card floats on top. Without one it is the plain
 * loading state a member sees while their data arrives.
 */
export function GuestCurtain({ children, card }: { children: ReactNode; card?: ReactNode }) {
  return (
    <Wrap aria-busy={card ? undefined : true}>
      <Behind $blur={Boolean(card)} aria-hidden={card ? true : undefined} inert={card ? true : undefined}>
        {children}
      </Behind>
      {card ? <Front>{card}</Front> : null}
    </Wrap>
  )
}
