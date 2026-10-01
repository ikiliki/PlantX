import styled, { keyframes } from 'styled-components'
import { theme } from '../../../../theme/tokens'

const pop = keyframes`
  from { opacity: 0; transform: scale(0); }
  to { opacity: 1; transform: none; }
`

export const Plot = styled.div<{ $height: number }>`
  position: relative;
  height: ${({ $height }) => $height}px;
  cursor: crosshair;
  touch-action: pan-y;
  user-select: none;
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
  circle.trade {
    transform-box: fill-box;
    transform-origin: center;
    animation: ${pop} 420ms ${theme.motion.spring} backwards;
    transition: fill-opacity ${theme.motion.fast} ${theme.motion.ease};
  }
`

export const Tooltip = styled.div`
  position: absolute;
  z-index: 2;
  display: grid;
  gap: 2px;
  width: 190px;
  padding: 8px 10px;
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
    opacity: 0.75;
  }
`

export const Empty = styled.p`
  display: grid;
  place-items: center;
  height: 100%;
  margin: 0;
  color: ${theme.colors.muted};
  font-size: 14px;
`
