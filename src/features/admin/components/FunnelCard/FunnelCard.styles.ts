import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

/** Many days fit sideways inside the card; the page itself never scrolls sideways. */
export const Scroll = styled.div`
  overflow-x: auto;
  min-width: 0;
  -webkit-overflow-scrolling: touch;
`

export const Table = styled.table`
  border-collapse: collapse;
  min-inline-size: 100%;
  font-size: 13px;
  font-variant-numeric: tabular-nums;

  th,
  td {
    padding: 8px 10px;
    border-top: 1px solid ${theme.colors.border};
    text-align: end;
    white-space: nowrap;
  }

  th:first-child,
  td:first-child {
    position: sticky;
    inset-inline-start: 0;
    background: ${theme.colors.creamCard};
    text-align: start;
    font-weight: 600;
    color: ${theme.colors.ink};
  }

  thead th {
    border-top: 0;
    font-size: 12px;
    font-weight: 600;
    color: ${theme.colors.muted};
  }

  td small {
    color: ${theme.colors.muted};
  }
`
