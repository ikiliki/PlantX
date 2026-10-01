import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Row = styled.div`
  display: inline-flex;
  height: 34px;
  padding: 2px;
  margin-bottom: ${theme.space.lg};
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipNeutral};
  border: 1px solid ${theme.colors.border};
`

export const Tab = styled(Link)<{ $on?: boolean }>`
  ${pressable}
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 14px;
  border-radius: ${theme.radii.pill};
  background: ${({ $on }) => ($on ? theme.colors.creamCard : 'transparent')};
  color: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.muted)};
  font-size: 13px;
  font-weight: ${({ $on }) => ($on ? 700 : 500)};
  box-shadow: ${({ $on }) => ($on ? theme.shadow.soft : 'none')};
  text-decoration: none;
`
