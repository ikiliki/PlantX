import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const TodoFace = styled.span`
  display: grid;
  gap: 2px;
  justify-items: center;
  min-width: 48px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: ${theme.colors.forest};
`

export const TodoCount = styled.span`
  display: grid;
  place-items: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipGreen};
  font-size: 12px;
`
