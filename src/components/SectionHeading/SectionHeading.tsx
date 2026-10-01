import type { ReactNode } from 'react'
import { Action, Copy, Eyebrow, Root, Title } from './SectionHeading.styles'

export function SectionHeading({
  eyebrow,
  title,
  actionLabel,
  actionTo,
  action,
}: {
  eyebrow?: string
  title?: string
  actionLabel?: string
  actionTo?: string
  action?: ReactNode
}) {
  return (
    <Root>
      <Copy>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        {title && <Title>{title}</Title>}
      </Copy>
      {action ?? (actionLabel && actionTo ? <Action to={actionTo}>{actionLabel}</Action> : null)}
    </Root>
  )
}
