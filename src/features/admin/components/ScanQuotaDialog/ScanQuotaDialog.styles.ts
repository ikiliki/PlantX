import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

/** A number field with its button, side by side; stacked on a narrow dialog. */
export const Row = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: end;

  @media (max-width: 420px) {
    grid-template-columns: minmax(0, 1fr);
  }
`

export const History = styled.ul`
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
`

export const HistoryRow = styled.li`
  display: grid;
  gap: 2px;
  padding: 8px 12px;
  border-radius: ${theme.radii.sm};
  background: ${theme.colors.chipNeutral};
  font-size: 13px;

  span {
    color: ${theme.colors.muted};
    overflow-wrap: anywhere;
  }
`
