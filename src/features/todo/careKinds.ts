import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import type { CareIcon, CareTask } from '../../mock/types'
import { theme } from '../../theme/tokens'
import { BUILT_IN_TASKS } from './carePlan'

type T = ReturnType<typeof useI18n>['t']

/** Each care icon's colour (calendar dots, icons, rows): water blue, photo metal, then the others. */
export function careColor(icon: CareIcon): string {
  if (icon === 'water' || icon === 'mist') return theme.colors.water
  if (icon === 'photo' || icon === 'clean') return theme.colors.metal
  if (icon === 'feed' || icon === 'prune') return theme.colors.feed
  if (icon === 'repot' || icon === 'pest') return theme.colors.repot
  return theme.colors.rotate
}

/** A light wash of the icon's colour for a row or chip background. */
export function careTint(icon: CareIcon, percent = 14): string {
  return `color-mix(in srgb, ${careColor(icon)} ${percent}%, var(--c-creamCard))`
}

/** A task the catalog no longer has (or not loaded yet): its id as a name, a sun icon. */
function unknownTask(id: string): CareTask {
  return BUILT_IN_TASKS.find((task) => task.id === id) ?? { id, name: id, nameHe: id, icon: 'sun', audience: 'linked' }
}

/** One line saying what to do. Built-in tasks have their own; tasks the admin adds share a plain one. */
function detailOf(id: string, t: T) {
  if (id === 'water') return t.todo.detailWater
  if (id === 'photo') return t.todo.detailPhoto
  if (id === 'feed') return t.todo.detailFeed
  if (id === 'repot') return t.todo.detailRepot
  if (id === 'rotate') return t.todo.detailRotate
  return t.todo.detailOther
}

/** "Watered · +10 XP" for the built-in tasks, "Mist · +10 XP" for the rest. */
function doneLineOf(task: CareTask, name: string, t: T, xp: number) {
  const line =
    task.id === 'water'
      ? t.http.doneWater
      : task.id === 'photo'
        ? t.http.donePhoto
        : task.id === 'feed'
          ? t.http.doneFeed
          : task.id === 'repot'
            ? t.http.doneRepot
            : task.id === 'rotate'
              ? t.http.doneRotate
              : t.http.doneOther.replace('{name}', name)
  return line.replace('{xp}', String(xp))
}

/** The catalog's care tasks by id, with their name, icon, colour and words in the current language. */
export function useCareTasks() {
  const { db } = useStore()
  const { t, tr } = useI18n()
  const tasks = db.catalog.careTasks?.length ? db.catalog.careTasks : BUILT_IN_TASKS
  const task = (id: string) => tasks.find((item) => item.id === id) ?? unknownTask(id)
  const name = (id: string) => {
    const found = task(id)
    return tr(found.name, found.nameHe)
  }
  return {
    tasks,
    task,
    name,
    icon: (id: string) => task(id).icon,
    color: (id: string) => careColor(task(id).icon),
    detail: (id: string) => detailOf(id, t),
    doneLine: (id: string, xp: number) => doneLineOf(task(id), name(id), t, xp),
  }
}
