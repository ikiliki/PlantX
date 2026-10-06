import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Root = styled.div`
  display: grid;
  gap: 8px;
  width: 100%;
  min-width: 0;
`

export const Hint = styled.p`
  margin: 0;
  color: ${theme.colors.muted};
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0;
  text-transform: none;
`
