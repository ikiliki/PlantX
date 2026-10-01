import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Track = styled.div`
  display: inline-flex;
  align-items: center;
  height: 40px;
  padding: 3px;
  gap: 2px;
  border-radius: ${theme.radii.pill};
  border: 1.5px solid ${theme.colors.border};
  background: ${theme.colors.creamCard};
  flex-shrink: 0;
`

export const Option = styled.button<{ $on?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 32px;
  padding: 0 14px;
  border: none;
  border-radius: ${theme.radii.pill};
  background: ${({ $on }) => ($on ? theme.colors.forest : 'transparent')};
  color: ${({ $on }) => ($on ? theme.colors.cream : theme.colors.muted)};
  font-size: 13px;
  font-weight: ${({ $on }) => ($on ? 700 : 600)};
  cursor: pointer;
  transition:
    background 0.18s ease,
    color 0.18s ease;

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.forest};
    outline-offset: 1px;
  }
`
