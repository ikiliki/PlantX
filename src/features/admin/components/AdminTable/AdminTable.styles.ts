import styled from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Scroll = styled.div<{ $embedded?: boolean }>`
  container-type: inline-size;
  max-width: 100%;
  min-width: 0;
  max-height: ${({ $embedded }) => ($embedded ? 'none' : '360px')};
  overflow: auto;
  -webkit-overflow-scrolling: touch;
`

export const ActionBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-height: 0;
  padding: 0 0 8px;
`

export const HeadActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
`

export const AddButton = styled.button`
  display: inline-grid;
  place-items: center;
  width: 22px;
  height: 22px;
  margin: 0;
  padding: 0;
  border-radius: ${theme.radii.pill};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.forest};
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0;
  text-transform: none;
  cursor: pointer;

  &:hover:not(:disabled) {
    border-color: ${theme.colors.forest};
    background: ${theme.colors.chipGreen};
  }
`

export const BulkBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: ${theme.colors.forest};

  > div {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
`

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th,
  td {
    padding: 8px 8px;
    border-bottom: 1px solid ${theme.colors.border};
    text-align: start;
    white-space: nowrap;
    vertical-align: middle;
  }

  th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: ${theme.colors.creamCard};
    color: ${theme.colors.moss};
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  th.check,
  td.check,
  th.expand,
  td.expand {
    width: 32px;
    padding-inline: 4px;
  }

  tr[data-selected='true'] td {
    background: rgba(207, 234, 120, 0.22);
  }

  tbody tr[data-openable='true'] {
    cursor: pointer;
  }

  tr.expand-row td {
    white-space: normal;
    background: ${theme.colors.cream};
  }

  tr:last-child td {
    border-bottom: 0;
  }

  th.actions {
    text-align: end;
    letter-spacing: 0;
    text-transform: none;
  }

  td.muted {
    color: ${theme.colors.muted};
  }
`

export const Check = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${theme.colors.forest};
  cursor: pointer;
`

export const ExpandBtn = styled.button`
  ${pressable}
  appearance: none;
  cursor: pointer;
  border: 0;
  width: 28px;
  height: 28px;
  border-radius: ${theme.radii.sm};
  background: transparent;
  color: ${theme.colors.forest};
  font-size: 12px;
  line-height: 1;

  &:hover {
    background: ${theme.colors.chipNeutral};
  }
`

export const ExpandCell = styled.td`
  padding: 12px 16px 16px !important;
`

export const ExpandBody = styled.div`
  position: sticky;
  inset-inline-start: 16px;
  width: calc(100cqw - 32px);
  min-width: 0;
`

export const RowActions = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
`

export const Empty = styled.p`
  margin: 0;
  padding: 8px 0;
  font-size: 13px;
  color: ${theme.colors.muted};
`

export const DetailGrid = styled.dl`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px 16px;
  margin: 0;
`

export const DetailItem = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;

  dt {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${theme.colors.moss};
  }

  dd {
    margin: 0;
    font-size: 13px;
    color: ${theme.colors.ink};
    word-break: break-word;
    white-space: normal;
  }
`
