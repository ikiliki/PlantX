import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { theme } from '../../../../theme/tokens'

const face = css<{ $compact?: boolean }>`
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: 8px 10px;
  min-width: 0;
  padding: ${({ $compact }) => ($compact ? '8px 10px' : '12px')};
  background:
    linear-gradient(165deg, rgba(207, 234, 120, 0.22), rgba(255, 254, 250, 0) 52%),
    ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadow.soft};
  color: inherit;
  text-decoration: none;

  &:hover {
    background:
      linear-gradient(165deg, rgba(207, 234, 120, 0.34), rgba(255, 254, 250, 0) 52%),
      ${theme.colors.cream};
  }
`

export const CardLink = styled(Link)<{ $compact?: boolean }>`
  ${face}
`

export const Copy = styled.span<{ $stamp?: boolean }>`
  display: grid;
  gap: 2px;
  min-width: 0;
  padding-top: 2px;
  padding-inline-end: ${({ $stamp }) => ($stamp ? '78px' : '0')};
`

export const NameRow = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`

export const Name = styled.span`
  flex: 1;
  min-width: 0;
  font-family: ${theme.fonts.display};
  font-size: 16px;
  line-height: 1.2;
  color: ${theme.colors.forest};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const Meta = styled.span`
  font-size: 12px;
  color: ${theme.colors.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const Bio = styled.span`
  font-size: 13px;
  line-height: 1.35;
  color: ${theme.colors.ink};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const Shelf = styled.span`
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
  min-width: 0;
`

const tile = css<{ $compact?: boolean }>`
  display: grid;
  place-items: center;
  height: ${({ $compact }) => ($compact ? '48px' : '72px')};
  min-width: 0;
  border-radius: 14px;
  overflow: hidden;
`

export const PlantTile = styled.span<{ $compact?: boolean }>`
  ${tile}
  display: block;
  background: ${theme.colors.chipGreen};

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const EmptyTile = styled.span<{ $compact?: boolean }>`
  ${tile}
  border: 1px dashed ${theme.colors.border};
  background: ${theme.colors.chipNeutral};
  color: ${theme.colors.moss};
`
