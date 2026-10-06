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
  gap: 8px;
  min-width: 0;
  width: 100%;
`

/** Save and Cancel sit right under the field being edited, at the field's end edge. */
export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`

export const ErrorText = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 650;
  color: ${theme.colors.danger};
`
