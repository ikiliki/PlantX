import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Field = styled.label`
  display: grid;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.muted};
`

export const Input = styled.input`
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  padding: 12px 14px;
  background: white;
  color: ${theme.colors.ink};
  width: 100%;
  &:focus {
    outline: 2px solid ${theme.colors.lime};
    border-color: transparent;
  }
`

export const Select = styled.select`
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  padding: 12px 14px;
  background: white;
  color: ${theme.colors.ink};
  width: 100%;
`

export const TextArea = styled.textarea`
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  padding: 12px 14px;
  background: white;
  color: ${theme.colors.ink};
  width: 100%;
  min-height: 88px;
  resize: vertical;
`

export const FormGrid = styled.div`
  display: grid;
  gap: ${theme.space.md};
`
