import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Root = styled.button<{ $filled?: boolean }>`
  appearance: none;
  cursor: pointer;
  width: 100%;
  min-height: 180px;
  display: grid;
  gap: 6px;
  place-content: center;
  justify-items: center;
  padding: ${theme.space.lg};
  border-radius: ${theme.radii.md};
  background: ${({ $filled }) => ($filled ? theme.colors.chipGreen : theme.colors.chipNeutral)};
  border: 1px dashed ${({ $filled }) => ($filled ? theme.colors.moss : theme.colors.border)};
  transition: 0.15s ease;
  &:hover {
    border-color: ${theme.colors.moss};
  }
`

export const Icon = styled.span`
  font-size: 24px;
  line-height: 1;
`

export const Label = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${theme.colors.ink};
`

export const Hint = styled.span`
  font-size: 12px;
  text-align: center;
  color: ${theme.colors.muted};
`

export const Preview = styled.img`
  width: 96px;
  height: 96px;
  border-radius: ${theme.radii.sm};
  object-fit: cover;
`
