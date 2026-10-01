import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Scroll = styled.div`
  max-height: 520px;
  overflow: auto;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.cream};
`

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th,
  td {
    padding: 10px 12px;
    border-bottom: 1px solid ${theme.colors.border};
    text-align: start;
    white-space: nowrap;
  }

  th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: ${theme.colors.chipNeutral};
    color: ${theme.colors.moss};
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  td:last-child {
    font-weight: 700;
    color: ${theme.colors.ink};
  }

  tr:last-child td {
    border-bottom: 0;
  }
`

export const Code = styled.span`
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: ${theme.colors.muted};
`
