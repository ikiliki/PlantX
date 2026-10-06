import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Pencil = styled.button`
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  flex: none;
  padding: 0;
  border: 1px solid transparent;
  border-radius: ${theme.radii.pill};
  background: transparent;
  color: ${theme.colors.moss};
  font-size: 14px;
  cursor: pointer;
  transition: background ${theme.motion.fast} ${theme.motion.ease};

  &:hover {
    background: ${theme.colors.chipGreen};
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${theme.shadow.focus};
  }
`

export const Editor = styled.div`
  display: grid;
  gap: 6px;
  min-width: 0;
  width: 100%;

  textarea {
    resize: none;
  }
`

/** One fixed line under the field: the character count, or a refused save's error. Never changes height. */
export const Status = styled.p<{ $error: boolean }>`
  min-height: 18px;
  margin: 0;
  font-size: 12px;
  font-weight: ${({ $error }) => ($error ? 650 : 500)};
  line-height: 18px;
  text-align: end;
  color: ${({ $error }) => ($error ? theme.colors.danger : theme.colors.muted)};
  font-variant-numeric: tabular-nums;
`
