import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Panel = styled.section`
  display: grid;
  gap: 12px;
  min-width: 0;
  padding: 14px 16px 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
`

export const Head = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
`

export const Title = styled.h2`
  margin: 0;
  font-size: 22px;
  color: ${theme.colors.forest};
`

export const Expand = styled(Link)`
  font-size: 13px;
  font-weight: 700;
  color: ${theme.colors.forest};
  white-space: nowrap;
  &:hover {
    text-decoration: underline;
  }
`

export const Stats = styled.dl`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
`

export const Stat = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.cream};
  dt {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${theme.colors.muted};
  }
  dd {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: ${theme.colors.ink};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

export const Empty = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${theme.colors.muted};
`
