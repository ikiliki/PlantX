import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Badge = styled.span<{ $tone?: 'lime' | 'forest' | 'warn' | 'danger' | 'muted' | 'info' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: ${theme.radii.pill};
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.01em;
  ${({ $tone = 'forest' }) => {
    switch ($tone) {
      case 'lime':
        return `background: ${theme.colors.chipGreen}; color: ${theme.colors.forest};`
      case 'warn':
        return `background: ${theme.colors.chipWarm}; color: ${theme.colors.forest};`
      case 'danger':
        return `background: ${theme.colors.chipDanger}; color: ${theme.colors.danger};`
      case 'muted':
        return `background: ${theme.colors.chipNeutral}; color: ${theme.colors.muted};`
      case 'info':
        return `background: ${theme.colors.chipInfo}; color: ${theme.colors.info};`
      default:
        return `background: ${theme.colors.forest}; color: var(--c-creamCard);`
    }
  }}
`
