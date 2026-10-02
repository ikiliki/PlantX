import { HealthChip } from './HealthChip'

export default {
  title: 'Components/HealthChip',
  component: HealthChip,
}

export const Letters = () => (
  <div style={{ display: 'flex', gap: 8, padding: 24 }}>
    {['S', 'A', 'B', 'C', 'D'].map((health) => (
      <HealthChip key={health} health={health} />
    ))}
  </div>
)

export const WithHint = () => <HealthChip health="S" hint="Best condition" />
