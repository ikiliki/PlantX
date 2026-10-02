import styled, { css, keyframes } from 'styled-components'
import { pressable } from '../../theme/motion'
import { theme } from '../../theme/tokens'

export const spin = keyframes`
  to { transform: rotate(360deg); }
`

export const Btn = styled.button<{ $busy: boolean }>`
  ${pressable}
  flex: none;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid ${theme.colors.border};
  border-radius: 50%;
  background: ${theme.colors.creamCard};
  color: ${theme.colors.forest};
  cursor: pointer;

  &:hover:not(:disabled) {
    border-color: ${theme.colors.forest};
  }

  &:disabled {
    cursor: progress;
  }

  svg {
    width: 18px;
    height: 18px;
    ${({ $busy }) =>
      $busy &&
      css`
        animation: ${spin} 0.8s linear infinite;
      `}
  }
`
