import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Root = styled.div`
  container-type: inline-size;
  display: grid;
  gap: ${theme.space.md};
  min-width: 0;
`

export const Controls = styled.div`
  display: grid;
  gap: 10px;
  align-items: center;
  min-width: 0;

  @container (min-width: 900px) {
    grid-template-columns: auto minmax(0, 1fr) minmax(200px, 280px);
  }
`

export const Empty = styled.p`
  margin: 0;
  padding: 16px;
  color: ${theme.colors.muted};
  font-size: 14px;
`

export const Changed = styled.span`
  display: grid;
  gap: 2px;
  font-size: 12px;

  em {
    font-style: normal;
    color: ${theme.colors.ink};
  }
`

export const Section = styled.section`
  display: grid;
  gap: 8px;
`

export const SectionTitle = styled.h2`
  margin: 0;
  font-size: 16px;
  font-weight: 750;
  color: ${theme.colors.forest};
`

export const Log = styled.ul`
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
`

export const LogRow = styled.li`
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
