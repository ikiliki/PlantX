import styled, { css } from 'styled-components'
import { pressable } from '../../theme/motion'
import { theme } from '../../theme/tokens'

export const segmentRow = css`
  display: inline-flex;
  flex-wrap: wrap;
  max-width: 100%;
  min-height: 34px;
  padding: 2px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipNeutral};
  border: 1px solid ${theme.colors.border};
`

export const segmentItem = css<{ $on?: boolean }>`
  ${pressable}
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 14px;
  border-radius: ${theme.radii.pill};
  background: ${({ $on }) => ($on ? theme.colors.creamCard : 'transparent')};
  color: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.muted)};
  font-size: 13px;
  font-weight: ${({ $on }) => ($on ? 700 : 500)};
  box-shadow: ${({ $on }) => ($on ? theme.shadow.soft : 'none')};
  text-decoration: none;
`

export const Row = styled.div`
  ${segmentRow}
  justify-self: start;
`

export const Item = styled.button<{ $on?: boolean }>`
  ${segmentItem}
  appearance: none;
  border: 0;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`
