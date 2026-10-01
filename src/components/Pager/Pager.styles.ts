import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Bar = styled.nav`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 4px 2px;
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.forest};
`

export const Range = styled.span`
  font-variant-numeric: tabular-nums;
`

export const Step = styled.button`
  background: ${theme.colors.creamCard};
  color: ${theme.colors.forest};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.pill};
  padding: 4px 10px;
  font: inherit;
  font-size: 13px;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`
