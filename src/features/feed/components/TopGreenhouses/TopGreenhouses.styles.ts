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

export const Row = styled(Link)`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2px 10px;
  align-items: center;
  min-width: 0;
  padding: 8px;
  border-radius: ${theme.radii.md};
  color: ${theme.colors.ink};
  text-decoration: none;

  &:hover {
    background: ${theme.colors.cream};
  }
`

export const Grade = styled.span`
  grid-row: span 2;
  min-width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: ${theme.radii.sm};
  background: ${theme.colors.chipGreen};
  color: ${theme.colors.forest};
  font-family: ${theme.fonts.display};
  font-size: 18px;
`

export const Name = styled.span`
  font-family: ${theme.fonts.display};
  font-size: 18px;
  line-height: 1.1;
  color: ${theme.colors.forest};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const Line = styled.span`
  font-size: 12px;
  color: ${theme.colors.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const Empty = styled.p`
  margin: 0 8px 8px;
  font-size: 13px;
  color: ${theme.colors.muted};
`
