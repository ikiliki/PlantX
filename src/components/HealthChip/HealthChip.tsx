import { Bubble, Chip, Wrap } from './HealthChip.styles'

export function HealthChip({ health, hint }: { health: string; hint?: string }) {
  if (!hint) return <Chip $health={health}>{health}</Chip>

  return (
    <Wrap tabIndex={0} aria-label={hint}>
      <Chip $health={health}>{health}</Chip>
      <Bubble role="tooltip">{hint}</Bubble>
    </Wrap>
  )
}
