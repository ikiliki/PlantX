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

export const SuggestRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px 16px;
  padding: 12px 14px;
  border: 1px dashed ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.cream};
  p {
    flex: 1 1 220px;
    margin: 0;
    font-size: 14px;
    line-height: 1.4;
    color: ${theme.colors.muted};
  }
`
