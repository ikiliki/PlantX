import styled from 'styled-components'
import { theme } from '../../theme/tokens'

const Track = styled.div`
  height: 10px;
  background: #E6ECE8;
  border-radius: ${theme.radii.pill};
  overflow: hidden;
`

const Fill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => Math.min(100, Math.max(0, $pct))}%;
  background: linear-gradient(90deg, ${theme.colors.green}, ${theme.colors.lime});
  border-radius: ${theme.radii.pill};
  transition: width 0.35s ease;
`

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: ${theme.colors.muted};
  margin-bottom: 6px;
  font-weight: 600;
`

export function ProgressBar({
  value,
  max,
  label,
}: {
  value: number
  max: number
  label?: string
}) {
  const pct = max ? (value / max) * 100 : 0
  return (
    <div>
      {label && (
        <Meta>
          <span>{label}</span>
          <span>
            {value}/{max} ({Math.round(pct)}%)
          </span>
        </Meta>
      )}
      <Track>
        <Fill $pct={pct} />
      </Track>
    </div>
  )
}
