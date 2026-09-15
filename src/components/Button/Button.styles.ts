import styled, { css } from 'styled-components'
import { theme } from '../../theme/tokens'

const variants = {
  primary: css`
    background: ${theme.colors.lime};
    color: ${theme.colors.forest};
    &:hover:not(:disabled) { filter: brightness(1.05); }
  `,
  secondary: css`
    background: ${theme.colors.forestSoft};
    color: white;
    &:hover:not(:disabled) { background: ${theme.colors.forestMid}; }
  `,
  ghost: css`
    background: transparent;
    color: ${theme.colors.forest};
    border: 1px solid ${theme.colors.border};
    &:hover:not(:disabled) { background: rgba(11,31,20,0.04); }
  `,
  danger: css`
    background: ${theme.colors.danger};
    color: white;
  `,
}

export const Button = styled.button<{ $variant?: keyof typeof variants; $block?: boolean; $size?: 'sm' | 'md' }>`
  appearance: none;
  border: none;
  cursor: pointer;
  border-radius: ${theme.radii.pill};
  font-weight: 700;
  padding: ${({ $size }) => ($size === 'sm' ? '8px 14px' : '12px 20px')};
  font-size: ${({ $size }) => ($size === 'sm' ? '13px' : '15px')};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: ${({ $block }) => ($block ? '100%' : 'auto')};
  transition: 0.15s ease;
  ${({ $variant = 'primary' }) => variants[$variant]}
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`
