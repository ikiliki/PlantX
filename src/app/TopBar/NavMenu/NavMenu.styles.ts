import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { menuIn } from '../../../theme/motion'
import { theme } from '../../../theme/tokens'

export const Drop = styled.div`
  position: relative;
`

export const Trigger = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

export const Caret = styled.button<{ $open?: boolean }>`
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  background: transparent;
  color: ${theme.surface.barMuted};
  cursor: pointer;
  transform: rotate(${({ $open }) => ($open ? 180 : 0)}deg);
  transition:
    transform ${theme.motion.base} ${theme.motion.ease},
    color ${theme.motion.fast} ${theme.motion.ease};
  &:hover {
    color: ${theme.surface.barInk};
  }
`

export const Panel = styled.div`
  animation: ${menuIn} ${theme.motion.base} ${theme.motion.ease} both;
  transform-origin: top center;
  position: absolute;
  top: calc(100% + 8px);
  inset-inline-start: 50%;
  translate: -50% 0;
  [dir='rtl'] & {
    translate: 50% 0;
  }
  min-width: 196px;
  max-height: min(70vh, 420px);
  overflow: auto;
  padding: 6px;
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  box-shadow: ${theme.shadow.card};
  z-index: ${theme.z.menu};
  scrollbar-width: thin;
`

export const Item = styled(Link)<{ $active?: boolean }>`
  display: block;
  padding: 10px 12px;
  border-radius: ${theme.radii.sm};
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? 700 : 600)};
  color: ${({ $active }) => ($active ? theme.colors.forest : theme.colors.ink)};
  background: ${({ $active }) => ($active ? theme.colors.chipNeutral : 'transparent')};
  white-space: nowrap;
  &:hover {
    background: ${theme.colors.chipNeutral};
  }
`

export const Rule = styled.hr`
  margin: 6px 8px;
  border: 0;
  border-top: 1px solid ${theme.colors.border};
`

export const Group = styled.div`
  display: grid;
  gap: 2px;
  padding: 2px 0 4px;
`

export const GroupLabel = styled.button<{ $open?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 8px 12px 4px;
  border: 0;
  background: transparent;
  font: inherit;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-align: start;
  color: ${theme.colors.muted};
  cursor: pointer;

  svg {
    flex: none;
    transform: rotate(${({ $open }) => ($open ? 180 : 0)}deg);
    transition: transform ${theme.motion.base} ${theme.motion.ease};
  }

  &:hover {
    color: ${theme.colors.forest};
  }
`

export const Nested = styled(Item)`
  padding-inline-start: 20px;
  font-size: 13px;
`
