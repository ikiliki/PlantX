import type { useI18n } from '../../i18n/I18nProvider'
import type { TodoSubcategory } from '../../mock/types'
import { theme } from '../../theme/tokens'

type T = ReturnType<typeof useI18n>['t']

/** Each kind of care's own colour (calendar dots, icons, rows): water blue, photo metal, then the newer kinds. */
export function careColor(kind: TodoSubcategory): string {
  if (kind === 'photo') return theme.colors.metal
  if (kind === 'feed') return theme.colors.feed
  if (kind === 'repot') return theme.colors.repot
  if (kind === 'rotate') return theme.colors.rotate
  return theme.colors.water
}

/** A light wash of the kind's colour for a row or chip background. */
export function careTint(kind: TodoSubcategory, percent = 14): string {
  return `color-mix(in srgb, ${careColor(kind)} ${percent}%, var(--c-creamCard))`
}

/** The verb on a button or row: Water, Photo, Feed, Repot, Turn. */
export function careAction(kind: TodoSubcategory, t: T): string {
  if (kind === 'photo') return t.todo.actionPhoto
  if (kind === 'feed') return t.todo.actionFeed
  if (kind === 'repot') return t.todo.actionRepot
  if (kind === 'rotate') return t.todo.actionRotate
  return t.todo.actionWater
}

/** The kind's name in lists and filters. */
export function careKindName(kind: TodoSubcategory, t: T): string {
  if (kind === 'photo') return t.todo.kindPhoto
  if (kind === 'feed') return t.todo.kindFeed
  if (kind === 'repot') return t.todo.kindRepot
  if (kind === 'rotate') return t.todo.kindRotate
  return t.todo.kindWater
}

/** One line saying what to do. */
export function careDetail(kind: TodoSubcategory, t: T): string {
  if (kind === 'photo') return t.todo.detailPhoto
  if (kind === 'feed') return t.todo.detailFeed
  if (kind === 'repot') return t.todo.detailRepot
  if (kind === 'rotate') return t.todo.detailRotate
  return t.todo.detailWater
}

/** "Watered · +10 XP" and its siblings. */
export function careDoneLine(kind: TodoSubcategory, t: T, xp: number): string {
  const line =
    kind === 'photo'
      ? t.http.donePhoto
      : kind === 'feed'
        ? t.http.doneFeed
        : kind === 'repot'
          ? t.http.doneRepot
          : kind === 'rotate'
            ? t.http.doneRotate
            : t.http.doneWater
  return line.replace('{xp}', String(xp))
}
