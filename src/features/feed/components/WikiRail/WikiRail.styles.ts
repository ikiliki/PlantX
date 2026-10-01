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

export const Head = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin: 4px 8px 8px;
`

export const Heading = styled.h2`
  margin: 0;
  font-size: 22px;
  color: ${theme.colors.forest};
`

export const Expand = styled(Link)`
  font-size: 12px;
  font-weight: 700;
  color: ${theme.colors.forest};
  white-space: nowrap;
  &:hover {
    text-decoration: underline;
  }
`

export const Row = styled(Link)`
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
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

export const Thumb = styled.span`
  grid-row: span 2;
  width: 40px;
  height: 40px;
  overflow: hidden;
  border-radius: ${theme.radii.sm};
  background: ${theme.colors.chipGreen};
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
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
