import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Badge = styled.span<{ $tone?: 'lime' | 'forest' | 'warn' | 'danger' | 'muted' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: ${theme.radii.pill};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  ${({ $tone = 'forest' }) => {
    switch ($tone) {
      case 'lime':
        return `background: ${theme.colors.lime}; color: ${theme.colors.forest};`
      case 'warn':
        return `background: #FFF3CD; color: #7A5A00;`
      case 'danger':
        return `background: #FDE8E6; color: ${theme.colors.danger};`
      case 'muted':
        return `background: #EEF1EF; color: ${theme.colors.muted};`
      default:
        return `background: ${theme.colors.forest}; color: white;`
    }
  }}
`
