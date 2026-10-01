import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Filters = styled.div`
  display: grid;
  gap: 10px;
  margin-bottom: ${theme.space.lg};
`

export const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`

export const FilterLabel = styled.span`
  min-width: 88px;
  font-size: 13px;
  font-weight: 700;
  color: ${theme.colors.ink};
`

export const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
`

export const Chip = styled.button<{ $on?: boolean; $off?: boolean }>`
  height: 32px;
  padding: 0 12px;
  border-radius: ${theme.radii.pill};
  border: 1px solid
    ${({ $on, $off }) => ($off ? theme.colors.border : $on ? theme.colors.forest : theme.colors.border)};
  background: ${({ $on, $off }) =>
    $off ? theme.colors.chipNeutral : $on ? theme.colors.chipGreen : theme.colors.creamCard};
  color: ${({ $off }) => ($off ? theme.colors.muted : theme.colors.ink)};
  font-size: 13px;
  font-weight: 600;
  cursor: ${({ $off }) => ($off ? 'default' : 'pointer')};
  opacity: ${({ $off }) => ($off ? 0.55 : 1)};
`

export const SortButton = styled.button<{ $on?: boolean }>`
  height: 32px;
  padding: 0 12px;
  border-radius: ${theme.radii.pill};
  border: 1px solid ${({ $on }) => ($on ? theme.colors.forest : theme.colors.border)};
  background: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.creamCard)};
  color: ${({ $on }) => ($on ? theme.colors.cream : theme.colors.ink)};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
`

export const Count = styled.span`
  margin-inline-start: 6px;
  font-size: 12px;
  font-weight: 700;
  color: ${theme.colors.muted};
`

export const Showing = styled.p`
  margin: 0 0 ${theme.space.md};
  font-size: 14px;
  font-weight: 700;
  color: ${theme.colors.ink};
`

export const Legend = styled.p`
  margin-bottom: ${theme.space.md};
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: ${theme.colors.forest};
`

export const List = styled.div`
  display: grid;
  gap: 12px;
`

export const ClassCard = styled.article`
  display: grid;
  grid-template-columns: 148px 1fr;
  gap: 14px;
  padding: 10px;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};

  @media (max-width: 640px) {
    grid-template-columns: 96px 1fr;
  }
`

export const Photo = styled.div`
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: ${theme.colors.chipNeutral};
`

export const Body = styled.div`
  display: grid;
  align-content: start;
  gap: 6px;
  min-width: 0;
`

export const Code = styled.strong`
  font-size: 13px;
  letter-spacing: 0.03em;
  color: ${theme.colors.greenDark};
  a {
    color: inherit;
  }
  a:hover {
    text-decoration: underline;
  }
`

export const Name = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${theme.colors.ink};
  a {
    color: inherit;
  }
  a:hover {
    text-decoration: underline;
  }
`

export const Facts = styled.span`
  font-size: 13px;
  color: ${theme.colors.forest};
`

export const Observed = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: ${theme.colors.ink};
`

export const Credit = styled.a`
  font-size: 12px;
  line-height: 1.3;
  color: ${theme.colors.muted};
  text-decoration: underline;
  text-underline-offset: 2px;
`

export const Empty = styled.p`
  margin: 0;
  color: ${theme.colors.muted};
`
