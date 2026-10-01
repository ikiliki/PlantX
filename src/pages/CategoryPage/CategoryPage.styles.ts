import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { riseIn } from '../../theme/motion'
import { theme } from '../../theme/tokens'

export const Page = styled.div`
  display: grid;
  gap: 20px;
`

export const Crumbs = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: ${theme.colors.muted};
`

export const Crumb = styled(Link)`
  color: ${theme.colors.muted};
  &:hover {
    color: ${theme.colors.forest};
  }
`

export const Head = styled.header`
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  animation: ${riseIn} ${theme.motion.slow} ${theme.motion.ease} backwards;
  h1 {
    margin: 0;
    font-size: clamp(24px, 3vw, 32px);
    line-height: 1.1;
  }
  p {
    margin: 4px 0 0;
    font-size: 13px;
    color: ${theme.colors.muted};
  }
`

export const Mark = styled.div`
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid ${theme.colors.border};
  border-radius: 50%;
  background: ${theme.colors.chipGreen};
`

export const Scientific = styled.em`
  font-style: italic;
`

export const Summary = styled.dl`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${theme.space.sm};
  margin: 0;
`

export const SummaryStat = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;
  padding: 12px 14px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.creamCard};
  animation: ${riseIn} ${theme.motion.slow} ${theme.motion.ease} backwards;
  ${[1, 2, 3, 4].map((n) => `&:nth-child(${n}) { animation-delay: ${n * 40}ms; }`).join('\n')}
  dt {
    font-size: 12px;
    color: ${theme.colors.muted};
  }
  dd {
    margin: 0;
    font-size: 17px;
    font-weight: 800;
    color: ${theme.colors.ink};
  }
`

export const Tabs = styled.div`
  display: flex;
  gap: 18px;
  border-bottom: 1px solid ${theme.colors.border};
`

export const Tab = styled.button<{ $on?: boolean }>`
  appearance: none;
  margin-bottom: -1px;
  padding: 10px 0;
  border: 0;
  border-bottom: 2px solid ${({ $on }) => ($on ? theme.colors.ink : 'transparent')};
  background: transparent;
  color: ${({ $on }) => ($on ? theme.colors.ink : theme.colors.muted)};
  font: inherit;
  font-size: 15px;
  font-weight: ${({ $on }) => ($on ? 700 : 500)};
  cursor: pointer;
`

export const TabLink = styled(Link)<{ $on?: boolean }>`
  margin-bottom: -1px;
  padding: 10px 0;
  border-bottom: 2px solid ${({ $on }) => ($on ? theme.colors.ink : 'transparent')};
  color: ${({ $on }) => ($on ? theme.colors.ink : theme.colors.muted)};
  font-size: 15px;
  font-weight: ${({ $on }) => ($on ? 700 : 500)};
  text-decoration: none;
`

export const Missing = styled.p`
  padding: ${theme.space.xxl} 0;
  color: ${theme.colors.muted};
  text-align: center;
`
