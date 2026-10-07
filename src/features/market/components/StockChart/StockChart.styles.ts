import styled, { keyframes } from 'styled-components'
import { fadeIn, pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

const draw = keyframes`
  from { stroke-dashoffset: 1; }
  to { stroke-dashoffset: 0; }
`

export const Root = styled.div`
  display: grid;
  gap: 14px;
  min-width: 0;
`

export const Top = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
`

export const Headline = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;
`

export const Label = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: ${theme.type.labelTracking};
  text-transform: ${theme.type.labelCase};
  color: ${theme.colors.muted};
`

export const Price = styled.p`
  margin: 0;
  font-size: clamp(36px, 5vw, 52px);
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  color: ${theme.colors.ink};
`

export const Delta = styled.p<{ $up: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: ${({ $up }) => ($up ? theme.colors.up : theme.colors.down)};
  span {
    font-weight: 500;
    color: ${theme.colors.muted};
  }
`

export const Ranges = styled.div`
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipNeutral};
`

export const RangeButton = styled.button<{ $on: boolean }>`
  ${pressable}
  min-width: 42px;
  padding: 6px 10px;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: ${({ $on }) => ($on ? theme.colors.forest : 'transparent')};
  color: ${({ $on }) => ($on ? theme.colors.cream : theme.colors.muted)};
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  &:hover:not([aria-pressed='true']) {
    background: ${theme.colors.chipGreen};
    color: ${theme.colors.forest};
  }
`

export const Plot = styled.div<{ $height: number }>`
  position: relative;
  height: ${({ $height }) => $height}px;
  border-radius: ${theme.radii.md};
  cursor: crosshair;
  touch-action: pan-y;
  user-select: none;
  &:focus-visible {
    outline: none;
    box-shadow: ${theme.shadow.focus};
  }
`

export const Svg = styled.svg`
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  text {
    font-family: ${theme.fonts.body};
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    fill: ${theme.colors.muted};
  }
  .line {
    animation: ${draw} 700ms ${theme.motion.ease} backwards;
  }
  .area,
  .marks {
    animation: ${fadeIn} 600ms ${theme.motion.ease} backwards;
  }
`

export const Tooltip = styled.div`
  position: absolute;
  top: 0;
  z-index: 2;
  display: grid;
  gap: 2px;
  min-width: 128px;
  padding: 7px 10px;
  border-radius: 10px;
  background: ${theme.colors.ink};
  color: ${theme.colors.cream};
  font-size: 12px;
  line-height: 1.35;
  font-variant-numeric: tabular-nums;
  pointer-events: none;
  box-shadow: ${theme.shadow.soft};
  strong {
    font-size: 15px;
  }
  span {
    opacity: 0.72;
  }
`

export const StatsGrid = styled.dl`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
  column-gap: 20px;
  margin: 0;
  border-top: 1px solid ${theme.colors.border};
`

export const StatItem = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 4px;
  border-bottom: 1px solid ${theme.colors.border};
  dt {
    font-size: 13px;
    color: ${theme.colors.muted};
  }
  dd {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: ${theme.colors.ink};
    white-space: nowrap;
    direction: ltr;
    unicode-bidi: isolate;
  }
`
