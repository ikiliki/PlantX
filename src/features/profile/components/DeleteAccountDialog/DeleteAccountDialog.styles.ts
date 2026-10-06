import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Counts = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.danger};
`

export const ErrorText = styled.p`
  margin: 8px 0 0;
  font-size: 13px;
  color: ${theme.colors.danger};
`
