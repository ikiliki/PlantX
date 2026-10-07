import styled, { css } from 'styled-components'
import { pressable } from '../../theme/motion'
import { theme } from '../../theme/tokens'

const variants = {
  primary: css`
    background: ${theme.colors.forest};
    color: ${theme.colors.cream};
    border: 1px solid ${theme.colors.forest};
    box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.22), ${theme.shadow.soft};
    &:hover:not(:disabled) {
      background: ${theme.colors.forestMid};
      transform: translateY(-2px);
    }
    &:active:not(:disabled) {
      box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.22);
    }
  `,
  secondary: css`
    background: ${theme.colors.creamCard};
    color: ${theme.colors.forest};
    border: 1px solid ${theme.colors.borderStrong};
    box-shadow: inset 0 -2px 0 ${theme.colors.border};
    &:hover:not(:disabled) {
      background: ${theme.colors.chipGreen};
      border-color: ${theme.colors.chipGreen};
      transform: translateY(-2px);
    }
  `,
  ghost: css`
    background: transparent;
    color: ${theme.colors.forest};
    border: 1px solid ${theme.colors.border};
    &:hover:not(:disabled) { background: rgba(18, 60, 45, 0.05); }
  `,
  growth: css`
    background: ${theme.colors.growth};
    color: ${theme.colors.forest};
    border: 1px solid ${theme.colors.growth};
    box-shadow: inset 0 -3px 0 rgba(154, 99, 18, 0.28), ${theme.shadow.soft};
    &:hover:not(:disabled) {
      transform: translateY(-2px);
    }
    &:active:not(:disabled) {
      box-shadow: inset 0 -1px 0 rgba(154, 99, 18, 0.28);
    }
  `,
  danger: css`
    background: ${theme.colors.danger};
    color: ${theme.colors.creamCard};
    border: 1px solid ${theme.colors.danger};
    &:hover:not(:disabled) { filter: brightness(0.94); }
  `,
  info: css`
    background: ${theme.colors.info};
    color: ${theme.colors.creamCard};
    border: 1px solid ${theme.colors.info};
    &:hover:not(:disabled) { filter: brightness(1.08); }
  `,
}

export const Button = styled.button<{ $variant?: keyof typeof variants; $block?: boolean; $size?: 'sm' | 'md' }>`
  appearance: none;
  cursor: pointer;
  border-radius: ${theme.radii.control};
  font-family: ${theme.fonts.display};
  font-weight: 600;
  letter-spacing: 0.01em;
  padding: ${({ $size }) => ($size === 'sm' ? `${theme.space.sm} ${theme.space.md}` : `12px 20px`)};
  font-size: ${({ $size }) => ($size === 'sm' ? '13px' : '14px')};
  min-height: ${({ $size }) => ($size === 'sm' ? theme.control.sm : theme.control.md)};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.space.sm};
  width: ${({ $block }) => ($block ? '100%' : 'auto')};
  ${pressable}
  ${({ $variant = 'primary' }) => variants[$variant]}
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`
