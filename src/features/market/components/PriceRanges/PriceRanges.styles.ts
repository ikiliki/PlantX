import { Link } from 'react-router-dom'
import styled, { css, keyframes } from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

const grow = keyframes`
  from { transform: scaleX(0.2); opacity: 0; }
  to { transform: none; opacity: 1; }
`

const pop = keyframes`
  from { transform: translate(-50%, -50%) scale(0); }
  to { transform: translate(-50%, -50%) scale(1); }
`

export const Root = styled.section`
  display: grid;
  gap: 10px;
  min-width: 0;
`

export const Head = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
`

export const Title = styled.h2`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-size: 24px;
  font-weight: ${theme.fonts.displayWeight};
  color: ${theme.colors.forest};
`

export const Hint = styled.p`
  margin: 2px 0 0;
  font-size: 13px;
  color: ${theme.colors.muted};
`

export const Sort = styled.div`
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipNeutral};
`

export const SortButton = styled.button<{ $on: boolean }>`
  ${pressable}
  padding: 6px 12px;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: ${({ $on }) => ($on ? theme.colors.forest : 'transparent')};
  color: ${({ $on }) => ($on ? theme.colors.cream : theme.colors.muted)};
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
`

const rowGrid = css`
  display: grid;
  grid-template-columns: minmax(150px, 230px) minmax(0, 1fr) 96px;
  align-items: center;
  gap: 14px;
  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      'name value'
      'track track';
    row-gap: 8px;
  }
`

export const Sheet = styled.div`
  display: grid;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  overflow: hidden;
`

export const AxisRow = styled.div`
  ${rowGrid}
  padding: 10px 16px 4px;
  background: ${theme.colors.cream};
  border-bottom: 1px solid ${theme.colors.border};
  @media (max-width: 640px) {
    grid-template-areas: 'track track';
    & > :not([data-track]) {
      display: none;
    }
  }
`

export const AxisTrack = styled.div`
  position: relative;
  height: 18px;
  grid-area: auto;
  @media (max-width: 640px) {
    grid-area: track;
  }
  span {
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    color: ${theme.colors.muted};
    white-space: nowrap;
  }
`

const rowBase = css<{ $highlight?: boolean }>`
  ${rowGrid}
  padding: 12px 16px;
  border-bottom: 1px solid ${theme.colors.border};
  color: ${theme.colors.ink};
  text-decoration: none;
  background: ${({ $highlight }) => ($highlight ? theme.colors.chipGreen : 'transparent')};
  transition: background ${theme.motion.fast} ${theme.motion.ease};
  &:last-child {
    border-bottom: 0;
  }
`

export const RowBox = styled.div<{ $highlight?: boolean }>`
  ${rowBase}
`

export const RowLink = styled(Link)<{ $highlight?: boolean }>`
  ${rowBase}
  &:hover {
    background: ${theme.colors.cream};
  }
`

export const Name = styled.div`
  display: grid;
  gap: 3px;
  min-width: 0;
  @media (max-width: 640px) {
    grid-area: name;
  }
  strong {
    overflow: hidden;
    font-size: 14px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

export const Sub = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  overflow: hidden;
  font-size: 12px;
  color: ${theme.colors.muted};
  white-space: nowrap;
  text-overflow: ellipsis;
`

export const Track = styled.div`
  position: relative;
  height: 26px;
  @media (max-width: 640px) {
    grid-area: track;
  }
`

export const GridLine = styled.span`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: ${theme.colors.border};
  opacity: 0.7;
`

export const Bar = styled.span<{ $index: number }>`
  position: absolute;
  top: 7px;
  height: 12px;
  min-width: 6px;
  border-radius: ${theme.radii.pill};
  transform-origin: left center;
  animation: ${grow} 520ms ${theme.motion.ease} backwards;
  animation-delay: ${({ $index }) => Math.min($index, 12) * 40}ms;
`

export const Dot = styled.span<{ $index: number; $size?: number }>`
  position: absolute;
  top: 50%;
  width: ${({ $size = 10 }) => $size}px;
  height: ${({ $size = 10 }) => $size}px;
  border: 2px solid ${theme.colors.creamCard};
  border-radius: 50%;
  box-shadow: 0 1px 3px color-mix(in srgb, var(--c-ink) 25%, transparent);
  transform: translate(-50%, -50%);
  animation: ${pop} 360ms ${theme.motion.spring} backwards;
  animation-delay: ${({ $index }) => 200 + Math.min($index, 12) * 40}ms;
`

export const Value = styled.div`
  display: grid;
  justify-items: end;
  gap: 1px;
  font-variant-numeric: tabular-nums;
  @media (max-width: 640px) {
    grid-area: value;
  }
  strong,
  small {
    direction: ltr;
    unicode-bidi: isolate;
  }
  strong {
    font-size: 15px;
  }
  small {
    font-size: 11px;
    color: ${theme.colors.muted};
    white-space: nowrap;
  }
`

export const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  font-size: 12px;
  color: ${theme.colors.muted};
`

export const LegendItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  i {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
`
