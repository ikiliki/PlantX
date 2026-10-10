import styled from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Root = styled.div`
  display: grid;
  gap: 8px;
  min-width: 0;
  padding-top: 4px;
`

/** "View all 5 comments": quiet text, opens the whole thread. */
export const ViewAll = styled.button`
  justify-self: start;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  font-size: ${theme.text.sm};
  font-weight: 700;
  color: ${theme.colors.muted};
  cursor: pointer;

  &:hover {
    color: ${theme.colors.forest};
    text-decoration: underline;
  }
`

export const List = styled.ul`
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
`

export const Item = styled.li`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 8px;
  align-items: start;
`

/** Name and text in one rounded bubble, like a chat line. */
export const Bubble = styled.p`
  justify-self: start;
  max-width: 100%;
  margin: 0;
  padding: 6px 12px;
  border-radius: 16px;
  background: ${theme.colors.chipNeutral};
  font-size: ${theme.text.sm};
  line-height: 1.4;
  color: ${theme.colors.ink};
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

export const Name = styled.strong`
  font-weight: 800;
`

export const Composer = styled.form`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
`

/** One line, pill shaped: "Write a comment…". */
export const Field = styled.input`
  min-width: 0;
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.ink};
  font: inherit;
  font-size: ${theme.text.sm};

  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 1px;
  }
`

export const Send = styled.button`
  ${pressable}
  min-height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.growth};
  color: ${theme.colors.onGrowth};
  font: inherit;
  font-size: ${theme.text.sm};
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`

export const Error = styled.p`
  margin: 0;
  font-size: ${theme.text.xs};
  color: ${theme.colors.danger};
`
