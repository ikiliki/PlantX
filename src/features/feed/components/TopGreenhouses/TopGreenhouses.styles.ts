import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Panel = styled.section`
  display: grid;
  gap: 8px;
  min-width: 0;
  padding: 12px;
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadow.soft};
`

export const Heading = styled.h2`
  margin: 4px 4px 0;
  font-size: 22px;
  color: ${theme.colors.forest};
`

export const List = styled.div`
  display: grid;
  gap: 8px;
  min-width: 0;
`

/** Home: one sideways row of the Global greenhouse cards; padding leaves room for their hover lift. */
export const Strip = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: min(56%, 190px);
  gap: ${theme.space.sm};
  min-width: 0;
  padding: 6px 2px 12px;
  margin: -6px -2px -12px;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  > * {
    scroll-snap-align: start;
  }
`
