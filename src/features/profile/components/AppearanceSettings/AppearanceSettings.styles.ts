import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Root = styled.div`
  display: grid;
  gap: 18px;
`

export const Field = styled.div`
  display: grid;
  gap: 8px;
  min-width: 0;
`

export const Label = styled.span`
  font-size: ${theme.text.sm};
  font-weight: 700;
  color: ${theme.colors.ink};
`

export const Hint = styled.span`
  font-size: ${theme.text.xs};
  color: ${theme.colors.muted};
`
