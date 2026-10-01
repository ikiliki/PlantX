import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Layout = styled.div`
  display: grid;
  gap: 20px;
  align-items: start;
  grid-template-columns: minmax(0, 1fr);
`

export const TocWrap = styled.div`
  justify-self: start;
`

export const Body = styled.div`
  display: grid;
  gap: 22px;
  min-width: 0;
`

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
`

export const Empty = styled.p`
  margin: 0;
  padding: 24px 8px;
  text-align: center;
  color: ${theme.colors.muted};
`
