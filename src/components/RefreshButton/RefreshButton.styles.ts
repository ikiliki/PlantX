import styled, { css, keyframes } from 'styled-components'
import { pressable } from '../../theme/motion'
import { theme } from '../../theme/tokens'

export const spin = keyframes`
  to { transform: rotate(360deg); }
`

export const Btn = styled.button<{ $busy: boolean; $pill?: boolean }>`
  ${pressable}
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: ${({ $pill }) => ($pill ? 'auto' : '36px')};
  height: ${({ $pill }) => ($pill ? theme.control.sm : '36px')};
  padding: ${({ $pill }) => ($pill ? '0 16px 0 12px' : '0')};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.pill};
  font-family: ${theme.fonts.display};
  font-size: ${theme.text.sm};
  font-weight: 600;
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
