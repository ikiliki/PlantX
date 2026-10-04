import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Root = styled.span`
  display: inline-flex;
  align-items: center;
  flex: none;
  padding: 2px 7px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.growth};
  color: ${theme.colors.forest};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.3;
  white-space: nowrap;
`
