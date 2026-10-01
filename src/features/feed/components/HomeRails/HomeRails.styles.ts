import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Panel = styled.section`
  display: grid;
  gap: 4px;
  padding: 12px;
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadow.soft};
`

export const Heading = styled.h2`
  margin: 4px 8px 8px;
  font-size: 22px;
  color: ${theme.colors.forest};
`

export const Item = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 8px;
  border-radius: ${theme.radii.md};
  color: ${theme.colors.ink};
  text-decoration: none;
  font-weight: 700;
  &:hover {
    background: ${theme.colors.cream};
  }
`

export const PersonCopy = styled.span`
  display: grid;
  min-width: 0;
  gap: 1px;
`

export const PersonName = styled.span`
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const PersonMeta = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${theme.colors.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const Mark = styled.span`
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: ${theme.radii.sm};
  background: ${theme.colors.chipGreen};
  color: ${theme.colors.forest};
  font-size: 16px;
`
