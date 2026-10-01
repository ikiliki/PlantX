import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Root = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px 16px;
  min-width: 0;
`

export const Line = styled.p`
  display: grid;
  gap: 2px;
  min-width: 0;
  margin: 0;
`

export const Label = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
`

export const Value = styled.span`
  font-size: 14px;
  line-height: 1.4;
  color: ${theme.colors.ink};
  overflow-wrap: anywhere;
`

export const Note = styled.p`
  grid-column: 1 / -1;
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: ${theme.colors.muted};
  overflow-wrap: anywhere;
`
