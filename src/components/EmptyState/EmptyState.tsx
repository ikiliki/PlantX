import styled from 'styled-components'
import { theme } from '../../theme/tokens'

const Wrap = styled.div`
  text-align: center;
  padding: ${theme.space.xl};
  color: ${theme.colors.muted};
  display: grid;
  gap: 8px;
  justify-items: center;
`

const Icon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #E8EEEA;
  display: grid;
  place-items: center;
  font-size: 24px;
`

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <Wrap>
      <Icon>🌿</Icon>
      <strong style={{ color: theme.colors.ink }}>{title}</strong>
      {hint && <p>{hint}</p>}
    </Wrap>
  )
}
