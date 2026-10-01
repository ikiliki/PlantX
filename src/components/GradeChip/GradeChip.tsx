import { Bubble, Chip, Wrap } from './GradeChip.styles'

export function GradeChip({ grade, hint }: { grade: string; hint?: string }) {
  if (!hint) return <Chip $grade={grade}>{grade}</Chip>

  return (
    <Wrap tabIndex={0} aria-label={hint}>
      <Chip $grade={grade}>{grade}</Chip>
      <Bubble role="tooltip">{hint}</Bubble>
    </Wrap>
  )
}
