import { Button } from '../Button/Button'
import { useAuth } from '../../features/auth/AuthProvider'
import { Actions, Body, Title, Wrap } from './GuestView.styles'

export function GuestView({
  title,
  body,
  action,
  secondary,
  card = false,
}: {
  title: string
  body: string
  action: string
  /** A try-it action that needs no account, under the log-in button. */
  secondary?: { label: string; onClick: () => void }
  /** A raised card, for floating over a blurred placeholder or sitting in a rail. */
  card?: boolean
}) {
  const { openAuth } = useAuth()
  return (
    <Wrap $card={card}>
      <Title>{title}</Title>
      <Body>{body}</Body>
      <Actions>
        <Button type="button" variant="growth" onClick={() => openAuth('buy')}>
          {action}
        </Button>
        {secondary ? (
          <Button type="button" variant="ghost" onClick={secondary.onClick}>
            {secondary.label}
          </Button>
        ) : null}
      </Actions>
    </Wrap>
  )
}
