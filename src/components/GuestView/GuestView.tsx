import { Button } from '../Button/Button'
import { useAuth } from '../../features/auth/AuthProvider'
import { Body, Title, Wrap } from './GuestView.styles'

export function GuestView({ title, body, action }: { title: string; body: string; action: string }) {
  const { openAuth } = useAuth()
  return (
    <Wrap>
      <Title>{title}</Title>
      <Body>{body}</Body>
      <Button type="button" variant="growth" onClick={() => openAuth('buy')}>
        {action}
      </Button>
    </Wrap>
  )
}
