import styled, { css } from 'styled-components'
import { pressable } from '../../theme/motion'
import { theme } from '../../theme/tokens'

const variants = {
  primary: css`
    background: ${theme.colors.forest};
    color: ${theme.colors.creamCard};
    border: 1px solid ${theme.colors.forest};
    &:hover:not(:disabled) {
      background: ${theme.colors.forestMid};
      box-shadow: ${theme.shadow.soft};
    }
  `,
  secondary: css`
    background: ${theme.colors.creamCard};
    color: ${theme.colors.forest};
    border: 1px solid ${theme.colors.border};
    &:hover:not(:disabled) {
      background: ${theme.colors.chipGreen};
      border-color: ${theme.colors.chipGreen};
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
    &:hover:not(:disabled) {
      filter: brightness(0.97);
      box-shadow: ${theme.shadow.soft};
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
  border-radius: ${theme.radii.pill};
  font-family: ${theme.fonts.body};
  font-weight: 500;
  padding: ${({ $size }) => ($size === 'sm' ? `${theme.space.sm} ${theme.space.md}` : `12px 20px`)};
  font-size: ${({ $size }) => ($size === 'sm' ? '13px' : '14px')};
  min-height: ${({ $size }) => ($size === 'sm' ? '34px' : '44px')};
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
