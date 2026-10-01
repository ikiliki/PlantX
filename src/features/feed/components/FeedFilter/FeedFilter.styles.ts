import styled from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
`

export const Tabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

export const Tab = styled.button<{ $on?: boolean }>`
  ${pressable}
  border: 1px solid ${({ $on }) => ($on ? theme.colors.growth : theme.colors.border)};
  border-radius: ${theme.radii.pill};
  background: ${({ $on }) => ($on ? theme.colors.growth : theme.colors.creamCard)};
  color: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.muted)};
  font: inherit;
  font-weight: 700;
  font-size: 13px;
  padding: 7px 14px;
  cursor: pointer;

  &:hover {
    color: ${theme.colors.forest};
  }
`

export const Friends = styled.button<{ $on?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-inline-start: auto;
  border: none;
  background: none;
  padding: 0;
  color: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.muted)};
  font: inherit;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    color: ${theme.colors.forest};
  }
`

export const Switch = styled.span<{ $on?: boolean }>`
  position: relative;
  width: 36px;
  height: 20px;
  flex-shrink: 0;
  border-radius: ${theme.radii.pill};
  background: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.track)};

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    inset-inline-start: ${({ $on }) => ($on ? '18px' : '2px')};
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${({ $on }) => ($on ? theme.colors.growth : theme.colors.creamCard)};
    transition: inset-inline-start 0.16s ease;
  }
`
