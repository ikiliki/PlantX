import styled from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Group = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

export const Pill = styled.button<{ $on: boolean }>`
  ${pressable}
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: 1px solid ${({ $on }) => ($on ? theme.colors.forest : theme.colors.border)};
  border-radius: ${theme.radii.pill};
  background: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.creamCard)};
  color: ${({ $on }) => ($on ? theme.colors.cream : theme.colors.ink)};
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  &:hover:not([aria-pressed='true']) {
    border-color: ${theme.colors.forest};
  }
  i {
    width: 9px;
    height: 9px;
    border-radius: 50%;
  }
  small {
    font-weight: 600;
    opacity: 0.7;
  }
`
