import styled from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Bar = styled.div`
  display: flex;
  gap: 8px;
`

export const Choice = styled.button<{ $on?: boolean }>`
  ${pressable}
  flex: 1;
  display: grid;
  place-items: center;
  height: 44px;
  border: 1px solid ${({ $on }) => ($on ? theme.colors.forest : theme.colors.border)};
  border-radius: ${theme.radii.md};
  background: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.creamCard)};
  color: ${({ $on }) => ($on ? theme.colors.cream : theme.colors.muted)};
  box-shadow: ${theme.shadow.soft};
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    color: ${({ $on }) => ($on ? theme.colors.cream : theme.colors.forest)};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.forest};
    outline-offset: 2px;
  }
`
