import type { ReactNode } from 'react'
import { Icon, type IconName } from '../Icon/Icon'
import { Action, Hint, Mark, Title, Wrap } from './EmptyState.styles'

/** A composed empty view: a mark, what is missing, why, and (optionally) the next step. */
export function EmptyState({
  title,
  hint,
  icon = 'greenhouse',
  action,
}: {
  title: string
  hint?: string
  icon?: IconName
  action?: ReactNode
}) {
  return (
    <Wrap role="status">
      <Mark aria-hidden>
        <Icon name={icon} size={26} />
      </Mark>
      <Title>{title}</Title>
      {hint ? <Hint>{hint}</Hint> : null}
      {action ? <Action>{action}</Action> : null}
    </Wrap>
  )
}
