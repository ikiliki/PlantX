import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Root = styled.div`
  display: grid;
  gap: 22px;
  min-width: 0;
`

export const AddForm = styled.form`
  display: flex;
  gap: 8px;
  max-width: 480px;
  min-width: 0;
`

export const AddInput = styled.input`
  flex: 1;
  min-width: 0;
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.ink};
  font: inherit;

  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 1px;
  }
`

export const Hint = styled.p`
  margin: -12px 0 0;
  font-size: ${theme.text.sm};
  color: ${theme.colors.muted};
`
