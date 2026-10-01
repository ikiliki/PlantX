import styled from 'styled-components'
import { pressable } from '../../theme/motion'
import { theme } from '../../theme/tokens'

export const Fab = styled.button<{ $visible: boolean }>`
  ${pressable}
  position: fixed;
  z-index: ${theme.z.floating};
  inset-inline-end: ${theme.space.lg};
  bottom: calc(${theme.layout.bottomNav} + ${theme.space.md} + env(safe-area-inset-bottom));
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.forest};
  box-shadow: ${theme.shadow.card};
  cursor: pointer;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: ${({ $visible }) => ($visible ? 'none' : 'translateY(12px) scale(0.9)')};
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  transition:
    opacity ${theme.motion.base} ${theme.motion.ease},
    transform ${theme.motion.base} ${theme.motion.spring},
    background ${theme.motion.fast} ${theme.motion.ease};
  &:hover {
    background: ${theme.colors.chipGreen};
  }
  @media (min-width: ${theme.breakpoints.md}) {
    bottom: ${theme.space.xl};
    inset-inline-end: ${theme.space.xl};
  }
`
