import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Root = styled.button<{ $selected?: boolean }>`
  appearance: none;
  cursor: pointer;
  text-align: start;
  display: grid;
  gap: 6px;
  padding: 18px;
  border-radius: ${theme.radii.md};
  background: ${({ $selected }) => ($selected ? theme.colors.chipGreen : theme.colors.creamCard)};
  border: 1px solid ${({ $selected }) => ($selected ? theme.colors.forest : theme.colors.border)};
  transition: 0.15s ease;
  &:hover {
    border-color: ${theme.colors.moss};
  }
`

export const Title = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: ${theme.colors.ink};
`

export const Description = styled.span`
  font-size: 12px;
  line-height: 1.4;
  color: ${theme.colors.muted};
`

export const TypeRow = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
`
