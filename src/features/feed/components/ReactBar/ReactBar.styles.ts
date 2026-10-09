import styled, { css, keyframes } from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

const sprout = keyframes`
  0% { transform: scale(1); }
  40% { transform: scale(1.35) rotate(-12deg); }
  100% { transform: scale(1); }
`

export const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`

export const Pill = styled.button<{ $on: boolean }>`
  ${pressable}
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid ${({ $on }) => ($on ? 'transparent' : theme.colors.border)};
  border-radius: ${theme.radii.pill};
  background: ${({ $on }) => ($on ? theme.colors.chipGreen : theme.colors.creamCard)};
  color: ${theme.colors.forest};
  font: inherit;
  font-size: ${theme.text.sm};
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 2px;
  }
`

export const Leaf = styled.span<{ $on?: boolean }>`
  display: inline-block;
  filter: ${({ $on }) => ($on ? 'none' : 'grayscale(0.85) opacity(0.7)')};
  ${({ $on }) =>
    $on &&
    css`
      animation: ${sprout} ${theme.motion.slow} ${theme.motion.ease};
    `}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const Count = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: ${theme.text.xs};
  font-weight: 800;
  color: ${theme.colors.muted};
  font-variant-numeric: tabular-nums;
`
