import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Links = styled.p`
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  font-size: 14px;

  a {
    color: ${theme.colors.greenDark};
    font-weight: 600;
  }
`

export const ErrorText = styled.p`
  margin: 8px 0 0;
  font-size: 13px;
  color: ${theme.colors.danger};
`
