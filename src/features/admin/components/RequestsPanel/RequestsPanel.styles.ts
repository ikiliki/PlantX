import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Stack = styled.div`
  display: grid;
  gap: 28px;
`

export const Block = styled.section`
  display: grid;
  gap: 12px;
`

export const Title = styled.h2`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: ${theme.colors.ink};
`

export const HistoryTitle = styled.h3`
  margin: 8px 0 0;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${theme.colors.muted};
`
