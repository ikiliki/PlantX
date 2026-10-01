import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { riseIn } from '../../theme/motion'
import { theme } from '../../theme/tokens'

export const Page = styled.div`
  display: grid;
  gap: 22px;
`

export const Back = styled(Link)`
  width: fit-content;
  font-size: 13px;
  font-weight: 700;
  color: ${theme.colors.muted};
  &:hover {
    color: ${theme.colors.forest};
  }
`

export const Header = styled.header`
  display: grid;
  gap: 6px;
  animation: ${riseIn} ${theme.motion.slow} ${theme.motion.ease} backwards;
  h1 {
    margin: 0;
  }
  p {
    margin: 0;
    max-width: 60ch;
    color: ${theme.colors.muted};
  }
`

export const Summary = styled.dl`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  overflow: hidden;
  @media (min-width: 800px) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
`

export const SummaryItem = styled.div`
  display: grid;
  gap: 4px;
  padding: 14px 16px;
  border-inline-end: 1px solid ${theme.colors.border};
  border-bottom: 1px solid ${theme.colors.border};
  @media (min-width: 800px) {
    border-bottom: 0;
    &:last-child {
      border-inline-end: 0;
    }
  }
  dt {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${theme.colors.muted};
  }
  dd {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: ${theme.colors.ink};
  }
`

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`
