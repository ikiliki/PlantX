import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { popIn } from '../../theme/motion'
import { theme } from '../../theme/tokens'

/** Rises above the floating dock (12px gap + the dock's height + a little air). */
export const Panel = styled.div`
  position: fixed;
  z-index: ${theme.z.menu};
  inset-inline: 16px;
  bottom: calc(12px + env(safe-area-inset-bottom) + 84px);
  display: grid;
  gap: 2px;
  max-height: min(60svh, 460px);
  overflow-y: auto;
  padding: 8px;
  border-radius: ${theme.radii.lg};
  background: ${theme.surface.dock};
  border: 1px solid ${theme.surface.dockEdge};
  box-shadow: ${theme.shadow.dialog};
  transform-origin: 50% 100%;
  animation: ${popIn} ${theme.motion.base} ${theme.motion.ease} both;
  overscroll-behavior: contain;

  @media (min-width: ${theme.breakpoints.md}) {
    display: none;
  }
`

export const Item = styled(Link)<{ $on: boolean }>`
  display: flex;
  align-items: center;
  min-height: ${theme.control.md};
  padding: 0 14px;
  border-radius: ${theme.radii.md};
  background: ${({ $on }) => ($on ? theme.surface.dockActive : 'transparent')};
  color: ${({ $on }) => ($on ? theme.colors.onGrowth : theme.surface.dockInk)};
  font-family: ${theme.fonts.display};
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;

  &:active {
    background: ${({ $on }) => ($on ? theme.surface.dockActive : theme.colors.chipGreen)};
  }
`

export const Rule = styled.hr`
  margin: 4px 10px;
  border: 0;
  border-top: 1px solid ${theme.colors.border};
`
