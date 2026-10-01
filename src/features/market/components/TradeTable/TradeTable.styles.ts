import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { riseIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Sheet = styled.div`
  display: grid;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  overflow: hidden;
`

export const Row = styled.div`
  display: grid;
  grid-template-columns: 96px minmax(0, 1.5fr) 60px 84px minmax(0, 1.4fr);
  gap: 10px;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid ${theme.colors.border};
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  color: ${theme.colors.ink};
  animation: ${riseIn} ${theme.motion.base} ${theme.motion.ease} backwards;
  &:last-child {
    border-bottom: 0;
  }
  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr) auto;
    row-gap: 2px;
    & > [data-col='date'] {
      grid-column: 1;
      grid-row: 2;
    }
    & > [data-col='qty'] {
      display: none;
    }
    & > [data-col='parties'] {
      grid-column: 1 / -1;
    }
  }
`

export const HeadRow = styled(Row)`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${theme.colors.muted};
  background: ${theme.colors.cream};
  animation: none;
  @media (max-width: 640px) {
    display: none;
  }
`

export const Muted = styled.span`
  color: ${theme.colors.muted};
  font-size: 13px;
`

export const ClassCell = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

export const ClassLink = styled(Link)`
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${theme.colors.forest};
  &:hover {
    text-decoration: underline;
  }
`

export const Parties = styled.span`
  overflow: hidden;
  font-size: 13px;
  color: ${theme.colors.muted};
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const Price = styled.strong`
  text-align: end;
`

export const Footer = styled.div`
  display: flex;
  justify-content: center;
  padding: 8px;
  border-top: 1px solid ${theme.colors.border};
  background: ${theme.colors.cream};
`

export const MoreButton = styled.button`
  padding: 6px 14px;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: transparent;
  color: ${theme.colors.forest};
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  &:hover {
    background: ${theme.colors.chipGreen};
  }
`

export const Empty = styled.p`
  margin: 0;
  padding: ${theme.space.lg};
  color: ${theme.colors.muted};
  text-align: center;
`
