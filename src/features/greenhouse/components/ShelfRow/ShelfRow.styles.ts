import styled from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Root = styled.section`
  display: grid;
  gap: 8px;
  min-width: 0;
`

export const Head = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px 12px;
  min-width: 0;
`

export const Name = styled.h3`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: ${theme.text.md};
  color: ${theme.colors.ink};
`

export const Count = styled.span`
  font-family: ${theme.fonts.body};
  font-size: ${theme.text.sm};
  font-weight: 700;
  color: ${theme.colors.muted};
`

export const Actions = styled.div`
  display: flex;
  gap: 4px;
`

export const IconButton = styled.button`
  ${pressable}
  min-width: 32px;
  min-height: 32px;
  padding: 0 10px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.forest};
  font: inherit;
  font-size: ${theme.text.xs};
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`

export const RenameForm = styled.form`
  display: flex;
  gap: 6px;
  flex: 1 1 220px;
  min-width: 0;
`

export const RenameInput = styled.input`
  flex: 1;
  min-width: 0;
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.ink};
  font: inherit;
`

/** One sideways row of cards; the page never scrolls sideways. */
export const Row = styled.ul`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: min(46%, 210px);
  gap: 10px;
  margin: 0;
  padding: 2px 2px 6px;
  list-style: none;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x proximity;
`

export const Cell = styled.li`
  display: grid;
  gap: 6px;
  align-content: start;
  min-width: 0;
  scroll-snap-align: start;
`

export const Move = styled.select`
  width: 100%;
  min-height: 34px;
  padding: 0 8px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.forest};
  font: inherit;
  font-size: ${theme.text.xs};
  font-weight: 700;
`

export const Empty = styled.p`
  margin: 0;
  padding: 14px;
  border: 1.5px dashed ${theme.colors.border};
  border-radius: ${theme.radii.md};
  font-size: ${theme.text.sm};
  color: ${theme.colors.muted};
`
