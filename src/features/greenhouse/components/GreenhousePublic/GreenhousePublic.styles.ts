import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { riseIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

/** One preview row, including its photo. The dialog window is a count of these. */
export const PREVIEW_ROW = 104
export const PREVIEW_GAP = 10

const gentleScroll = css`
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--c-moss) 55%, transparent) transparent;
  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
    margin: 4px 0;
  }
  &::-webkit-scrollbar-thumb {
    border: 2px solid transparent;
    border-radius: 99px;
    background: color-mix(in srgb, var(--c-moss) 45%, transparent);
    background-clip: padding-box;
  }
`

export const Root = styled.div<{ $compact?: boolean }>`
  display: flex;
  flex-direction: column;
  align-content: start;
  min-width: 0;
  min-height: 0;
  padding: ${theme.space.xl} ${theme.space.lg};
  ${({ $compact }) =>
    $compact &&
    css`
      flex: 1 1 auto;
      overflow: hidden;
      padding: 16px 16px 18px;
    `}
`

export const Section = styled.section<{ $compact?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${theme.space.md};
  min-width: 0;
  min-height: 0;
  ${({ $compact }) =>
    $compact &&
    css`
      flex: 1 1 auto;
    `}
  &:first-child header {
    padding-inline-end: 48px;
  }
`

export const SectionHead = styled.header`
  display: flex;
  flex: 0 0 auto;
  align-items: baseline;
  gap: ${theme.space.sm};
  h3 {
    margin: 0;
    font-family: ${theme.fonts.display};
    font-size: 24px;
    font-weight: ${theme.fonts.displayWeight};
    color: ${theme.colors.forest};
  }
`

export const Count = styled.span`
  padding: 2px 9px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipGreen};
  color: ${theme.colors.forest};
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`

export const PlantScroll = styled.div<{ $rows: number }>`
  ${gentleScroll}
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: ${PREVIEW_GAP}px;
  min-height: 0;
  max-height: ${({ $rows }) => {
    if ($rows <= 0) return '0px'
    return `${$rows * PREVIEW_ROW + ($rows - 1) * PREVIEW_GAP}px`
  }};
`

const pressable = css`
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;
  &:focus-visible {
    outline: 2px solid ${theme.colors.moss};
    outline-offset: 3px;
    border-radius: ${theme.radii.md};
  }
`

export const PlantRow = styled.button`
  ${pressable}
  display: grid;
  flex: 0 0 ${PREVIEW_ROW}px;
  grid-template-columns: ${PREVIEW_ROW}px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  width: 100%;
  height: ${PREVIEW_ROW}px;
  min-width: 0;
  animation: ${riseIn} ${theme.motion.slow} ${theme.motion.ease} backwards;
`

export const RowThumb = styled.span`
  display: block;
  width: ${PREVIEW_ROW}px;
  height: ${PREVIEW_ROW}px;
  overflow: hidden;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.chipGreen};
`

export const RowCopy = styled.span`
  display: grid;
  gap: 4px;
  min-width: 0;
`

export const GoGreenhouse = styled(Link)`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  margin-top: 4px;
  padding: 10px 16px;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.forest};
  color: ${theme.colors.creamCard};
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
  &:hover {
    background: ${theme.colors.forestMid};
  }
  &:focus-visible {
    outline: 2px solid ${theme.colors.moss};
    outline-offset: 3px;
  }
`

const stagger = [1, 2, 3, 4, 5, 6, 7, 8]
  .map((n) => `& > :nth-child(${n}) { animation-delay: ${n * 50}ms; }`)
  .join('\n')

export const PlantGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: ${theme.space.sm};
  & > * {
    animation: ${riseIn} ${theme.motion.slow} ${theme.motion.ease} backwards;
  }
  ${stagger}
`

const tileFace = css`
  display: grid;
  gap: 6px;
  min-width: 0;
  color: ${theme.colors.ink};
`

export const PlantTile = styled.button`
  ${tileFace}
  ${pressable}
  width: 100%;
`

export const PlantThumb = styled.span`
  display: block;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.chipGreen};
`

export const PlantName = styled.span`
  overflow: hidden;
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const TileMeta = styled.span`
  display: block;
  min-height: 16px;
  overflow: hidden;
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: ${theme.colors.forest};
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const Empty = styled.p`
  margin: 0;
  padding: ${theme.space.lg};
  border: 1px dashed ${theme.colors.border};
  border-radius: ${theme.radii.md};
  color: ${theme.colors.muted};
  font-size: 14px;
  text-align: center;
`
