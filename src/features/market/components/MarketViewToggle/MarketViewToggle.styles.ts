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

  /* Desktop shows list and map together, so there is nothing to switch. */
  @container (min-width: 960px) {
    display: none;
  }
`

export const Option = styled.button<{ $on?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 40px;
  height: 32px;
  padding: 0;
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
    width: 17px;
    height: 17px;
    flex-shrink: 0;
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.forest};
    outline-offset: 1px;
  }
`
