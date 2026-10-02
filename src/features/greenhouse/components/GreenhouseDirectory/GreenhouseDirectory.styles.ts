import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Root = styled.div`
  display: grid;
  gap: 14px;
  min-width: 0;
`

export const Search = styled.input`
  width: 100%;
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.ink};
  font: inherit;
  font-size: 14px;

  &::placeholder {
    color: ${theme.colors.muted};
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${theme.shadow.focus};
  }
`

export const List = styled.div`
  display: grid;
  gap: 8px;
  min-width: 0;
`

export const Empty = styled.p`
  margin: 0;
  padding: 28px 20px;
  text-align: center;
  color: ${theme.colors.muted};
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
`
