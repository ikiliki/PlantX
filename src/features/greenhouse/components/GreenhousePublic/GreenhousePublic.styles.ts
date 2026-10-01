import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { media, riseIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

const gentleScroll = css`
  overflow-x: hidden;
  overflow-y: scroll;
  scrollbar-gutter: stable;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: rgba(93, 124, 78, 0.55) transparent;
  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
    margin: 10px 0;
  }
  &::-webkit-scrollbar-thumb {
    border: 2px solid transparent;
    border-radius: 99px;
    background: rgba(93, 124, 78, 0.45);
    background-clip: padding-box;
  }
`

export const Root = styled.div<{ $compact?: boolean }>`
  display: grid;
  align-content: start;
  gap: ${theme.space.xl};
  min-width: 0;
  min-height: 0;
  padding: ${theme.space.xl} ${theme.space.lg};
  ${media.md} {
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  ${({ $compact }) =>
    $compact &&
    css`
      max-height: 50vh;
      ${gentleScroll}
      ${media.sm} {
        max-height: 70vh;
      }
    `}
`

export const Section = styled.section`
  display: grid;
  gap: ${theme.space.md};
  &:first-child header {
    padding-inline-end: 48px;
  }
`

export const SectionHead = styled.header`
  display: flex;
  align-items: baseline;
  gap: ${theme.space.sm};
  h3 {
    margin: 0;
    font-family: ${theme.fonts.display};
    font-size: 24px;
    font-weight: 400;
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

const stagger = [1, 2, 3, 4, 5, 6, 7, 8]
  .map((n) => `& > :nth-child(${n}) { animation-delay: ${n * 50}ms; }`)
  .join('\n')

const sideScroll = css`
  display: flex;
  align-items: flex-start;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
  & > * {
    scroll-snap-align: start;
    animation: ${riseIn} ${theme.motion.slow} ${theme.motion.ease} backwards;
  }
  ${stagger}
`

const tileWidth = '156px'

export const PlantGrid = styled.div`
  ${sideScroll}
  gap: ${theme.space.sm};
  & > * {
    flex: 0 0 ${tileWidth};
    width: ${tileWidth};
  }
`

export const SeeGreenhouse = styled(Link)`
  align-self: flex-start;
  display: block;
  min-width: 0;
  background: ${theme.colors.creamCard};
  color: inherit;
  text-decoration: none;
  &:focus-visible {
    outline: 2px solid ${theme.colors.moss};
    outline-offset: 3px;
    border-radius: ${theme.radii.md};
  }
`

export const SeeFace = styled.span`
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 8px;
  aspect-ratio: 1;
  padding: 12px;
  border: 1px dashed ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: transparent;
  color: ${theme.colors.forest};
  transition:
    background ${theme.motion.fast} ${theme.motion.ease},
    border-color ${theme.motion.fast} ${theme.motion.ease};

  ${SeeGreenhouse}:hover & {
    background: ${theme.colors.creamCard};
    border-color: ${theme.colors.moss};
  }
`

export const SeeMark = styled.span`
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.growth};
  color: ${theme.colors.forest};
  font-size: 26px;
  font-weight: 500;
  line-height: 1;

  html[dir='rtl'] & {
    transform: scaleX(-1);
  }
`

export const SeeLabel = styled.span`
  max-width: 100%;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.25;
  text-align: center;
`

const tileFace = css`
  display: grid;
  gap: 6px;
  min-width: 0;
  color: ${theme.colors.ink};
`

export const PlantTile = styled.div`
  ${tileFace}
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
