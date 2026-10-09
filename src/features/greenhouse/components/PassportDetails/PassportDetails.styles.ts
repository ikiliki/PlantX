import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Root = styled.div`
  display: grid;
  gap: 12px;
  min-width: 0;
`

/** Label / value pairs: two columns when there is room, stacked on a narrow passport. */
export const Grid = styled.dl`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 4px 16px;
  margin: 0;

  @container (min-width: 420px) {
    grid-template-columns: 140px minmax(0, 1fr);
    row-gap: 12px;
    align-items: center;
  }
`

export const Label = styled.dt`
  font-size: ${theme.text.xs};
  font-weight: 800;
  color: ${theme.colors.muted};
`

export const Value = styled.dd`
  margin: 0 0 8px;
  min-width: 0;
  font-size: ${theme.text.sm};
  color: ${theme.colors.ink};
  overflow-wrap: anywhere;

  @container (min-width: 420px) {
    margin: 0;
  }

  a {
    color: ${theme.colors.forest};
    font-weight: 700;
  }
`

export const Select = styled.select`
  width: min(260px, 100%);
  min-height: 38px;
  padding: 0 10px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.ink};
  font: inherit;
`
