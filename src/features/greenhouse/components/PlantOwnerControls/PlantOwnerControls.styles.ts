import styled from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

/** One quiet row on the passport: who can see the plant, then Delete at the end. */
export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
`

/** Public / Private as one two-way pill; the chosen side is filled. */
export const Switch = styled.div`
  display: inline-flex;
  padding: 3px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipNeutral};
  box-shadow: inset 0 0 0 1px ${theme.colors.border};
`

export const Side = styled.button<{ $on: boolean }>`
  ${pressable}
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  padding: 0 12px;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: ${({ $on }) => ($on ? theme.colors.forest : 'transparent')};
  color: ${({ $on }) => ($on ? theme.colors.creamCard : theme.colors.muted)};
  font: inherit;
  font-size: 12px;
  font-weight: 750;
  cursor: pointer;

  &:disabled {
    cursor: default;
  }

  &:hover:not(:disabled) {
    color: ${({ $on }) => ($on ? theme.colors.creamCard : theme.colors.ink)};
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${theme.shadow.focus};
  }
`

export const Delete = styled.button`
  ${pressable}
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  padding: 0 10px;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: none;
  color: ${theme.colors.danger};
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: rgba(180, 85, 61, 0.08);
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${theme.shadow.focus};
  }
`

/** Fixed line under the switch: what the choice means, or a refused save. */
export const Note = styled.p<{ $error?: boolean }>`
  flex-basis: 100%;
  min-height: 18px;
  margin: 0;
  font-size: 12px;
  line-height: 18px;
  color: ${({ $error }) => ($error ? theme.colors.danger : theme.colors.muted)};
`
