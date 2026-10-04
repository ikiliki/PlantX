import styled from 'styled-components'
import { pressable } from '../../theme/motion'
import { theme } from '../../theme/tokens'

export { Dock, Panel, PanelHead, DemoLabel as BarLabel, Tab } from '../DemoBar/DemoBar.styles'

export const TokenField = styled.label`
  display: grid;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
`

export const TokenInput = styled.input`
  width: 100%;
  min-width: 0;
  background: ${theme.colors.forestSoft};
  color: ${theme.colors.creamCard};
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: ${theme.radii.sm};
  padding: ${theme.space.xs} ${theme.space.sm};
  font: inherit;
`

export const Users = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(150px, 100%), 1fr));
  gap: 6px;
`

export const UserButton = styled.button<{ $current: boolean }>`
  ${pressable}
  padding: 6px 10px;
  border-radius: ${theme.radii.sm};
  border: 1px solid ${({ $current }) => ($current ? theme.colors.growth : 'rgba(255, 255, 255, 0.2)')};
  background: ${({ $current }) => ($current ? theme.colors.growth : 'transparent')};
  color: ${({ $current }) => ($current ? theme.colors.forest : theme.colors.creamCard)};
  font: inherit;
  font-weight: 600;
  text-align: start;
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: wait;
  }
`

export const Note = styled.p`
  margin: 0;
  opacity: 0.8;
`
