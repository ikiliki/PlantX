import styled from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Root = styled.div`
  display: grid;
  gap: 10px;
  min-width: 0;
`

export const List = styled.ul`
  display: grid;
  gap: 10px;
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

export const Body = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;
  padding: 8px 12px;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.chipNeutral};
`

export const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 8px;
`

export const Name = styled.span`
  font-size: ${theme.text.sm};
  font-weight: 800;
  color: ${theme.colors.ink};
`

export const When = styled.time`
  font-size: ${theme.text.xs};
  color: ${theme.colors.muted};
`

export const Delete = styled.button`
  margin: 0;
  margin-inline-start: auto;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  font-size: ${theme.text.xs};
  font-weight: 700;
  color: ${theme.colors.muted};
  text-decoration: underline;
  cursor: pointer;
`

export const Text = styled.p`
  margin: 0;
  font-size: ${theme.text.sm};
  line-height: 1.45;
  color: ${theme.colors.ink};
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`

export const Empty = styled.p`
  margin: 0;
  padding: 8px 2px;
  font-size: ${theme.text.sm};
  color: ${theme.colors.muted};
`

export const Composer = styled.form`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: end;
`

export const Field = styled.textarea`
  min-height: 42px;
  max-height: 140px;
  padding: 10px 14px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.ink};
  font: inherit;
  font-size: ${theme.text.base};
  resize: vertical;

  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 1px;
  }
`

export const Send = styled.button`
  ${pressable}
  min-height: 42px;
  padding: 0 16px;
  border: 0;
  border-radius: ${theme.radii.control};
  background: ${theme.colors.growth};
  color: ${theme.colors.onGrowth};
  font: inherit;
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
