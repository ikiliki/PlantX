import type {
  CommunityGrade,
  CommunityGradeLetter,
  GradeStackScenario,
  Plant,
  PublishRequirement,
} from '../../mock/types'

const SCORE: Record<CommunityGradeLetter, number> = { C: 1, B: 2, A: 3, S: 4 }
const LETTERS: CommunityGradeLetter[] = ['C', 'B', 'A', 'S']

export const FEW_GRADE_CARDS = 5
export const SWIPE_THRESHOLD = 88

/** Average of S=4, A=3, B=2, C=1, rounded to the nearest letter. */
export function aggregateCommunityGrade(grades: CommunityGrade[] | undefined): CommunityGradeLetter | null {
  if (!grades?.length) return null
  const average = grades.reduce((sum, grade) => sum + SCORE[grade.letter], 0) / grades.length
  const index = Math.min(4, Math.max(1, Math.round(average))) - 1
  return LETTERS[index]
}

export function swipeLetter(x: number, y: number, threshold = SWIPE_THRESHOLD): CommunityGradeLetter | null {
  const ax = Math.abs(x)
  const ay = Math.abs(y)
  if (Math.max(ax, ay) < threshold) return null
  if (ay > ax) return y < 0 ? 'S' : 'B'
  return x > 0 ? 'A' : 'C'
}

/** Published plants this person has not graded yet, trimmed by the grade-tab mock. */
export function selectGradeQueue(plants: Plant[], scenario: GradeStackScenario, actorId: string): Plant[] {
  if (scenario === 'empty') return []
  const open = plants.filter(
    (plant) =>
      plant.publishedAt &&
      plant.ownerId !== actorId &&
      !(plant.grades ?? []).some((grade) => grade.graderId === actorId),
  )
  open.sort((a, b) => {
    const aKnown = (a.grades?.length ?? 0) > 0 ? 0 : 1
    const bKnown = (b.grades?.length ?? 0) > 0 ? 0 : 1
    if (aKnown !== bKnown) return aKnown - bKnown
    const byDate = (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '')
    return byDate || a.id.localeCompare(b.id)
  })
  if (scenario === 'one') return open.slice(0, 1)
  if (scenario === 'few') return open.slice(0, FEW_GRADE_CARDS)
  return open
}

/** What the demo publish requirement still needs from this plant, if anything. */
export function publishBlocker(
  plant: Pick<Plant, 'verifiedAt' | 'grades'>,
  requirement: PublishRequirement,
): 'verified' | 'graded' | null {
  if (requirement === 'verified' && !plant.verifiedAt) return 'verified'
  if (requirement === 'graded' && !plant.grades?.length) return 'graded'
  return null
}

export function formatGradeWhen(iso: string, locale: 'he' | 'en'): string {
  const then = Date.parse(iso)
  if (!Number.isFinite(then)) return iso
  const delta = then - Date.now()
  const abs = Math.abs(delta)
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  const rtf = new Intl.RelativeTimeFormat(locale === 'he' ? 'he' : 'en', { numeric: 'auto' })
  if (abs < hour) return rtf.format(Math.round(delta / minute), 'minute')
  if (abs < day) return rtf.format(Math.round(delta / hour), 'hour')
  if (abs < 14 * day) return rtf.format(Math.round(delta / day), 'day')
  return new Date(then).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
