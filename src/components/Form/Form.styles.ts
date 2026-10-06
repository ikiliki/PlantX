import styled, { css } from 'styled-components'
import { theme } from '../../theme/tokens'

const control = css`
  border: 1px solid ${theme.colors.borderStrong};
  border-radius: ${theme.radii.md};
  padding: 12px 14px;
  background: ${theme.colors.creamCard};
  color: ${theme.colors.ink};
  width: 100%;
  transition:
    border-color ${theme.motion.fast} ${theme.motion.ease},
    box-shadow ${theme.motion.base} ${theme.motion.ease};
  &::placeholder {
    color: ${theme.colors.muted};
  }
  &:hover:not(:disabled) {
    border-color: ${theme.colors.moss};
  }
  &:focus,
  &:focus-visible {
    outline: none;
    border-color: ${theme.colors.forest};
    box-shadow: 0 0 0 4px ${theme.colors.chipGreen};
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export const Field = styled.label`
  display: grid;
  gap: 6px;
  font-size: ${theme.text.sm};
  font-weight: 600;
  color: ${theme.colors.ink};
`

export const Input = styled.input`
  ${control}
`

export const Select = styled.select`
  ${control}
  cursor: pointer;
`

export const TextArea = styled.textarea`
  ${control}
  min-height: 88px;
  line-height: 1.5;
  resize: vertical;
`

export const FormGrid = styled.div`
  display: grid;
  gap: ${theme.space.md};
`
