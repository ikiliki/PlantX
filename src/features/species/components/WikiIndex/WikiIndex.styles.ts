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

export const Tools = styled.div`
  display: grid;
  gap: 10px;
  min-width: 0;
`

export const Search = styled.input`
  width: min(100%, 420px);
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.ink};
  font: inherit;

  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 1px;
  }
`

/** 2 columns on a phone, up to 5 wide. */
export const TileGrid = styled.div`
  container-type: inline-size;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }

  @media (min-width: 1100px) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
`
