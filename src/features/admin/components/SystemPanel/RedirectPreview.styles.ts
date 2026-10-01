import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Chooser = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

export const Choice = styled.button<{ $on: boolean }>`
  min-height: 36px;
  padding: 0 14px;
  border-radius: ${theme.radii.pill};
  border: 1px solid ${({ $on }) => ($on ? theme.colors.forest : theme.colors.border)};
  background: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.creamCard)};
  color: ${({ $on }) => ($on ? theme.colors.cream : theme.colors.forest)};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;

  &:focus-visible {
    outline: none;
    box-shadow: ${theme.shadow.focus};
  }
`

/** Clips the full-screen hold into the admin window. */
export const Frame = styled.div`
  height: min(640px, 70svh);
  overflow: hidden;
  border-radius: ${theme.radii.md};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.cream};
`
