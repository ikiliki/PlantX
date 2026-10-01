import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Page = styled.div`
  display: grid;
  gap: 18px;
`

export const Crumbs = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${theme.colors.muted};
`

export const Back = styled(Link)`
  font-size: 13px;
  font-weight: 700;
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
`

export const Mark = styled.div`
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 50%;
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.chipGreen};
`

export const Name = styled.h1`
  font-size: clamp(22px, 3vw, 28px);
  line-height: 1.1;
  color: ${theme.colors.ink};
`

export const Meta = styled.p`
  margin-top: 4px;
  font-size: 13px;
  color: ${theme.colors.muted};
`

export const Desk = styled.div`
  display: grid;
  gap: 16px;
  align-items: stretch;
  @media (min-width: 960px) {
    grid-template-columns: minmax(0, 1.7fr) minmax(280px, 0.85fr);
    grid-template-areas: 'profile side';
  }
`

export const ProfileCard = styled.section`
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 580px;
  overflow: hidden;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  @media (min-width: 960px) {
    grid-area: profile;
  }
  & > article {
    flex: 1 1 auto;
    min-height: 0;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }
`

export const SideColumn = styled.div`
  display: grid;
  gap: 14px;
  align-content: start;
  min-width: 0;
  @media (min-width: 960px) {
    grid-area: side;
  }
`

export const ChartTabBody = styled.div`
  min-width: 0;
  border: 1px solid ${theme.colors.border};
  border-top: 0;
  border-radius: 0 0 ${theme.radii.lg} ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  overflow: hidden;

  section {
    border: 0;
    border-radius: 0;
    animation: none;
  }
`

export const Change = styled.span<{ $up: boolean }>`
  font-size: 16px;
  font-weight: 700;
  color: ${({ $up }) => ($up ? theme.colors.up : theme.colors.down)};
`

export const Sub = styled.p`
  font-size: 13px;
  color: ${theme.colors.muted};
`

export const Ticket = styled.aside`
  display: grid;
  align-content: start;
  gap: 12px;
  padding: 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
`

export const TicketLabel = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${theme.colors.muted};
`

export const TicketValue = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 14px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.cream};
  font-size: 22px;
  font-weight: 700;
  color: ${theme.colors.ink};
  span {
    font-size: 13px;
    font-weight: 600;
    color: ${theme.colors.muted};
  }
`

export const Blurred = styled.div`
  filter: blur(7px);
  pointer-events: none;
  user-select: none;
`

export const BlurredText = styled.span`
  filter: blur(5px);
  user-select: none;
`

export const Notice = styled.p`
  font-size: 13px;
  font-weight: 700;
  color: ${theme.colors.forest};
`

export const SideStats = styled.dl`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
  @media (min-width: 1100px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`

export const Stat = styled.div`
  display: grid;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.creamCard};
  dt {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${theme.colors.muted};
  }
  dd {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: ${theme.colors.ink};
  }
`

export const BookBlock = styled.section`
  display: grid;
  gap: 0;
  min-width: 0;
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

export const Sheet = styled.div`
  display: grid;
  max-height: 240px;
  overflow: auto;
  border: 1px solid ${theme.colors.border};
  border-radius: 0 0 ${theme.radii.lg} ${theme.radii.lg};
  background: ${theme.colors.creamCard};
`

export const Row = styled.div<{ $blur?: boolean }>`
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) 0.65fr 0.45fr 0.55fr;
  gap: 10px;
  align-items: center;
  padding: 8px 18px;
  border-bottom: 1px solid ${theme.colors.border};
  font-size: 13px;
  color: ${theme.colors.ink};
  ${({ $blur }) =>
    $blur &&
    `
    filter: blur(4px);
    pointer-events: none;
    user-select: none;
  `}
  &:last-child {
    border-bottom: 0;
  }
`

export const HeadRow = styled(Row)`
  padding: 7px 18px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${theme.colors.muted};
  background: ${theme.colors.cream};
`

export const Side = styled.span<{ $bid?: boolean }>`
  font-weight: 700;
  color: ${({ $bid }) => ($bid ? theme.colors.up : theme.colors.down)};
`
