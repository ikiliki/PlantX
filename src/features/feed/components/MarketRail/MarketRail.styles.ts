import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Blotter = styled.section`
  display: grid;
  align-content: start;
  gap: 2px;
  min-width: 0;
  padding: 14px 14px 16px;
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadow.soft};
`

export const GlanceSlot = styled.div`
  min-width: 0;
  margin-top: 6px;
`

export const Subhead = styled.h3`
  margin: 14px 4px 6px;
  font-size: 20px;
  color: ${theme.colors.forest};
`

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`

export const Cell = styled.th`
  padding: 4px 6px 6px;
  text-align: start;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${theme.colors.muted};
  border-block-end: 1px solid ${theme.colors.border};

  &:nth-child(n + 2) {
    text-align: end;
    white-space: nowrap;
  }
`

export const RowCell = styled.td`
  padding: 7px 6px;
  text-align: start;
  vertical-align: baseline;
  border-block-end: 1px solid ${theme.colors.border};
  min-width: 0;

  &:nth-child(n + 2) {
    text-align: end;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    color: ${theme.colors.ink};
    font-weight: 700;
  }

  &:last-child {
    font-weight: 500;
    color: ${theme.colors.muted};
  }
`

export const SaleLink = styled(Link)`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: ${theme.colors.ink};
  font-weight: 700;
  text-decoration: none;

  &:hover {
    color: ${theme.colors.forest};
  }
`

export const EmptyNote = styled.p`
  margin: 0 8px 4px;
  font-size: 13px;
  color: ${theme.colors.muted};
`
