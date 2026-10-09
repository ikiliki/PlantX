import styled, { keyframes } from 'styled-components'
import { theme } from '../../theme/tokens'

const spin = keyframes`
  to { transform: rotate(360deg); }
`

/** Above every popup: edits often happen inside one (the passport). */
export const Pill = styled.div<{ $on: boolean; $saved: boolean }>`
  position: fixed;
  z-index: calc(${theme.z.dialogTop} + 20);
  top: calc(12px + env(safe-area-inset-top));
  left: 50%;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 16px 0 12px;
  border-radius: ${theme.radii.pill};
  background: ${({ $saved }) => ($saved ? theme.colors.growth : theme.colors.creamCard)};
  color: ${({ $saved }) => ($saved ? theme.colors.onGrowth : theme.colors.forest)};
  box-shadow: ${theme.shadow.lift};
  font-family: ${theme.fonts.display};
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
  opacity: ${({ $on }) => ($on ? 1 : 0)};
  transform: translate(-50%, ${({ $on }) => ($on ? '0' : '-14px')}) scale(${({ $on }) => ($on ? 1 : 0.94)});
  transition:
    opacity ${theme.motion.base} ${theme.motion.ease},
    transform ${theme.motion.base} ${theme.motion.ease},
    background ${theme.motion.base} ${theme.motion.ease},
    color ${theme.motion.base} ${theme.motion.ease};

  @media (prefers-reduced-motion: reduce) {
    transition: opacity 1ms;
  }
`

export const Spinner = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid ${theme.colors.chipGreen};
  border-top-color: ${theme.colors.forest};
  animation: ${spin} 0.7s linear infinite;
`

/** A small drawn tick. */
export const Check = styled.span`
  position: relative;
  width: 16px;
  height: 16px;

  &::after {
    content: '';
    position: absolute;
    left: 5px;
    top: 1px;
    width: 5px;
    height: 10px;
    border: solid currentColor;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
`
