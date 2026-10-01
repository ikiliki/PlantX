import styled from 'styled-components'
import { pressable } from '../../theme/motion'
import { theme } from '../../theme/tokens'

export const Dock = styled.div`
  position: fixed;
  top: 0;
  left: 50%;
  z-index: ${theme.z.demoBar};
  transform: translateX(-50%);
  width: max-content;
  max-width: calc(100vw - 16px);

  @media (max-width: ${theme.breakpoints.md}) {
    left: auto;
    inset-inline-start: 10px;
    transform: none;
  }
`

export const Tab = styled.button<{ $open: boolean }>`
  ${pressable}
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0 auto;
  padding: 3px 12px 5px;
  border: 1px solid rgba(207, 234, 120, 0.35);
  border-top: 0;
  border-radius: 0 0 ${theme.radii.pill} ${theme.radii.pill};
  background: ${theme.colors.forest};
  color: ${theme.colors.creamCard};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: ${({ $open }) => ($open ? 'none' : theme.shadow.soft)};
`

export const Panel = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: min(760px, calc(100vw - 16px));
  max-height: min(72vh, 560px);
  overflow: auto;
  display: grid;
  gap: 10px;
  margin-top: 6px;
  padding: 12px;
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.forest};
  color: ${theme.colors.creamCard};
  font-size: 12px;
  box-shadow: ${theme.shadow.dialog};
`

export const PanelHead = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const DemoLabel = styled.span`
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.7;
`

export const Pin = styled.button<{ $on: boolean }>`
  ${pressable}
  margin-inline-start: auto;
  padding: 4px 10px;
  border-radius: ${theme.radii.pill};
  border: 1px solid ${({ $on }) => ($on ? theme.colors.growth : 'rgba(255, 255, 255, 0.25)')};
  background: ${({ $on }) => ($on ? theme.colors.growth : 'transparent')};
  color: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.creamCard)};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
`

export const Fields = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`

export const Field = styled.label`
  display: grid;
  gap: 4px;
  min-width: 0;
  font-size: 11px;
  font-weight: 600;
`

export const DemoSelect = styled.select`
  width: 100%;
  min-width: 0;
  background: ${theme.colors.forestSoft};
  color: ${theme.colors.creamCard};
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: ${theme.radii.sm};
  padding: ${theme.space.xs} ${theme.space.sm};
  cursor: pointer;
  &:hover {
    border-color: rgba(207, 234, 120, 0.5);
  }
`

export const ResetButton = styled.button`
  ${pressable}
  justify-self: start;
  padding: ${theme.space.xs} 12px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: ${theme.radii.pill};
  background: transparent;
  color: ${theme.colors.creamCard};
  font-size: 12px;
  cursor: pointer;
  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`
