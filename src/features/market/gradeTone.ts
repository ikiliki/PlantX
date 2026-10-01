import { theme } from '../../theme/tokens'

/** Strong tone for dots and lines, soft tone for bars. Matches GradeChip. */
export const GRADE_TONE: Record<string, { strong: string; soft: string }> = {
  A: { strong: theme.colors.greenDark, soft: theme.colors.chipGreen },
  B: { strong: '#C08A2E', soft: theme.colors.chipWarm },
  C: { strong: theme.colors.danger, soft: '#F6DED4' },
}

export function gradeTone(grade: string | undefined) {
  return GRADE_TONE[grade ?? ''] ?? { strong: theme.colors.muted, soft: theme.colors.chipNeutral }
}
