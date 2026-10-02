import styled from 'styled-components'
import { theme } from '../../theme/tokens'

function tone(health: string) {
  if (health === 'S') return { bg: theme.colors.forest, fg: theme.colors.cream }
  if (health === 'A') return { bg: theme.colors.chipGreen, fg: theme.colors.forest }
  if (health === 'B') return { bg: theme.colors.chipWarm, fg: theme.colors.warn }
  if (health === 'C') return { bg: '#F6DED4', fg: theme.colors.danger }
  if (health === 'D') return { bg: '#E8DDD6', fg: theme.colors.muted }
  return { bg: theme.colors.chipNeutral, fg: theme.colors.muted }
}

export const Chip = styled.span<{ $health: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border-radius: ${theme.radii.sm};
  font-weight: 800;
  font-size: 13px;
  background: ${({ $health }) => tone($health).bg};
  color: ${({ $health }) => tone($health).fg};
`

export const Wrap = styled.span`
  position: relative;
  display: inline-flex;
  cursor: help;
  border-radius: ${theme.radii.sm};
  &:focus-visible {
    outline: 2px solid ${theme.colors.green};
    outline-offset: 2px;
  }
`

export const Bubble = styled.span`
  position: absolute;
  z-index: 3;
  bottom: calc(100% + 8px);
  inset-inline-start: 0;
  width: max-content;
  max-width: 240px;
  padding: 8px 10px;
  border-radius: 10px;
  background: ${theme.colors.ink};
  color: ${theme.colors.cream};
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  white-space: normal;
  opacity: 0;
  pointer-events: none;
  transform: translateY(4px);
  transition: opacity 0.15s ease, transform 0.15s ease;

  ${Wrap}:hover &,
  ${Wrap}:focus-within & {
    opacity: 1;
    transform: none;
  }
`
