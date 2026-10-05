import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Root = styled.p<{ $out: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 6px 12px;
  border-radius: ${theme.radii.pill};
  background: ${(p) => (p.$out ? theme.colors.chipWarm : theme.colors.chipGreen)};
  color: ${(p) => (p.$out ? theme.colors.warn : theme.colors.forest)};
  font-size: 13px;
  font-weight: 650;
  min-width: 0;
`

export const Dots = styled.span`
  display: inline-flex;
  gap: 4px;
  flex: none;
`

export const Dot = styled.span<{ $on: boolean }>`
  width: 9px;
  height: 9px;
  border-radius: 50%;
  border: 2px solid ${theme.colors.aiBlue};
  background: ${(p) => (p.$on ? theme.colors.aiBlue : 'transparent')};
`

export const Text = styled.span`
  min-width: 0;
`
