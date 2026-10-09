import { theme } from '../../theme/tokens'

/** Strong tone for dots and lines, soft tone for bars. Matches HealthChip. */
export const HEALTH_TONE: Record<string, { strong: string; soft: string }> = {
  S: { strong: theme.colors.forest, soft: theme.colors.chipGreen },
  A: { strong: theme.colors.greenDark, soft: theme.colors.chipGreen },
  B: { strong: '#C08A2E', soft: theme.colors.chipWarm },
  C: { strong: theme.colors.danger, soft: theme.colors.chipDanger },
  D: { strong: '#8A6A62', soft: '#E8DDD6' },
}

export function healthTone(health: string | undefined) {
  return HEALTH_TONE[health ?? ''] ?? { strong: theme.colors.muted, soft: theme.colors.chipNeutral }
}
