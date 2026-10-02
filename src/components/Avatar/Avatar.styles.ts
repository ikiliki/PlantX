import styled from 'styled-components'

export const Circle = styled.span<{ $color: string; $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  color: #fffefa;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  line-height: 0;
`

export const Glyph = styled.svg`
  display: block;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
`
