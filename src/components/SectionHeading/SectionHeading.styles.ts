import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { theme } from '../../theme/tokens'

export const Root = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${theme.space.md};
  width: 100%;
`

export const Copy = styled.div`
  display: grid;
  gap: 6px;
`

export const Eyebrow = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
`

export const Title = styled.h2`
  font-size: clamp(24px, 3vw, 32px);
  color: ${theme.colors.ink};
`

export const Action = styled(Link)`
  font-size: 13px;
  color: ${theme.colors.forest};
  white-space: nowrap;
  &::after {
    content: ' →';
  }
  [dir='rtl'] &::after {
    content: ' ←';
  }
  &:hover {
    text-decoration: underline;
  }
`
