import styled from 'styled-components'

const Circle = styled.div<{ $color: string; $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  color: white;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: ${({ $size }) => Math.max(11, $size * 0.38)}px;
  flex-shrink: 0;
`

export function Avatar({ name, color, size = 40 }: { name: string; color: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
  return (
    <Circle $color={color} $size={size} aria-hidden>
      {initials}
    </Circle>
  )
}
