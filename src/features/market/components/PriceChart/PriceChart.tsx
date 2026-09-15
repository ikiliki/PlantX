import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

const Wrap = styled.div`
  background: #f3f7f4;
  border-radius: ${theme.radii.md};
  padding: 12px;
  height: 140px;
`

const Svg = styled.svg`
  width: 100%;
  height: 100%;
  overflow: visible;
`

export function PriceChart({
  points,
  up,
}: {
  points: { t: string; price: number }[]
  up: boolean
}) {
  if (points.length < 2) return null
  const prices = points.map((p) => p.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const span = max - min || 1
  const w = 100
  const h = 40
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w
      const y = h - ((p.price - min) / span) * h
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
  const area = `${path} L ${w} ${h} L 0 ${h} Z`
  const stroke = up ? theme.colors.green : theme.colors.danger
  const fill = up ? 'rgba(31,168,90,0.15)' : 'rgba(196,69,54,0.12)'

  return (
    <Wrap>
      <Svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <path d={area} fill={fill} />
        <path
          d={path}
          fill="none"
          stroke={stroke}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </Svg>
    </Wrap>
  )
}
