import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Root = styled.div`
  display: grid;
  gap: 12px;
  min-width: 0;
  width: 100%;
`

export const Empty = styled.p`
  margin: 0;
  padding: 20px 4px;
  color: ${theme.colors.muted};
  font-size: 14px;
  line-height: 1.45;
`
