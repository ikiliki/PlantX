import type { Catalog, CareRule, CareTask, CareTaskRule, Plant, PlantCare } from '../../mock/types'

/**
 * Care plans: which care tasks a plant gets and how often. Shared by the server (scheduling) and the
 * browser (passport, Tasks, admin). Pure, no React.
 *
 * Tasks are catalog data (`catalog.careTasks`). For one plant and one task:
 * - whether it applies: the owner turned it off or added it; else the variety's rule, the category's rule,
 *   then the task's audience (`all` → must, `optional` / `linked` → not unless a rule or the owner says so);
 * - how often: the owner's interval, else the variety's, the category's, then the task's default.
 * No interval at all means the owner gets a "Set schedule" task instead of a made-up number.
 */

/** The tasks every catalog starts with. Water and photo are built in (feed posts, first watering). */
export const BUILT_IN_TASKS: CareTask[] = [
  { id: 'water', name: 'Water', nameHe: 'השקיה', icon: 'water', audience: 'all', interval: { everyDays: 7, winterEveryDays: 12 }, builtIn: true },
  { id: 'photo', name: 'Photo check-in', nameHe: 'צילום מעקב', icon: 'photo', audience: 'all', interval: { everyDays: 30 }, builtIn: true },
  { id: 'feed', name: 'Feed', nameHe: 'דישון', icon: 'feed', audience: 'all', interval: { everyDays: 30, months: [3, 4, 5, 6, 7, 8, 9] } },
  { id: 'repot', name: 'Repot', nameHe: 'העברת עציץ', icon: 'repot', audience: 'all', interval: { everyDays: 365 } },
  { id: 'rotate', name: 'Turn to the light', nameHe: 'סיבוב לאור', icon: 'rotate', audience: 'linked', interval: { everyDays: 14 } },
  { id: 'mist', name: 'Mist', nameHe: 'ריסוס', icon: 'mist', audience: 'linked', interval: { everyDays: 3 } },
]

/** The plant history line finished care adds: the built-in tasks in their own words, others "<name> done". */
export function careHistory(task: Pick<CareTask, 'id' | 'name' | 'nameHe'>): { label: string; labelHe: string } {
  if (task.id === 'water') return { label: 'Watered', labelHe: 'הושקה' }
  if (task.id === 'photo') return { label: 'Photo refreshed', labelHe: 'התמונה רועננה' }
  if (task.id === 'feed') return { label: 'Fed', labelHe: 'קיבל דשן' }
  if (task.id === 'repot') return { label: 'Repotted', labelHe: 'הועבר לעציץ חדש' }
  if (task.id === 'rotate') return { label: 'Turned to the light', labelHe: 'סובב לאור' }
  return { label: `${task.name} done`, labelHe: `${task.nameHe} בוצע` }
}

/** How many days back finished care may be logged (plus today): water a week, a photo a month, the rest a month. */
export function careFillDays(kind: string) {
  if (kind === 'water') return 7
  if (kind === 'photo') return 31
  return 30
}

/** Intervals an owner or admin can pick, in days. */
export const CARE_INTERVAL_CHOICES = [2, 3, 4, 5, 7, 10, 14, 21, 30, 60, 90, 180, 365, 730]

export type EffectiveCare = {
  task: CareTask
  /** The plant gets this task (must, or the owner added an optional one). */
  active: boolean
  /** An optional task the owner has not added: offered under "Add a task". */
  offered: boolean
  /** The interval in use; undefined → the owner is asked to set one. */
  interval?: CareRule
  /** What the catalog suggests (the default shown when editing) and who said so. */
  suggested?: CareRule
  suggestedFrom?: { source: 'variety' | 'category' | 'task'; ai: boolean }
  /** The owner changed this task on their plant (interval, off, or added). */
  own: boolean
}

type CarePlant = Pick<Plant, 'speciesId' | 'subcategoryId' | 'care'>
type CareCatalog = Pick<Catalog, 'categories' | 'careTasks' | 'careRules'>

/** The category and variety rules for one task on this plant. */
export function rulesFor(plant: Pick<Plant, 'speciesId' | 'subcategoryId'>, catalog: CareCatalog, taskId: string) {
  const category = catalog.categories.find((item) => item.speciesId === plant.speciesId)
  const rules = catalog.careRules ?? []
  const variety = plant.subcategoryId
    ? rules.find((rule) => rule.taskId === taskId && rule.subcategoryId === plant.subcategoryId)
    : undefined
  const forCategory = category
    ? rules.find((rule) => rule.taskId === taskId && rule.categoryId === category.id && !rule.subcategoryId)
    : undefined
  return { variety, category: forCategory }
}

/** Every catalog task for this plant: whether it applies and how often. */
export function careFor(plant: CarePlant, catalog: CareCatalog): EffectiveCare[] {
  return (catalog.careTasks ?? []).map((task) => {
    const { variety, category } = rulesFor(plant, catalog, task.id)
    const own = plant.care?.[task.id]
    const ruled: CareTaskRule | undefined = variety ?? category
    const mode = ruled?.mode ?? (task.audience === 'all' ? 'must' : task.audience === 'optional' ? 'optional' : 'off')
    const active = own?.off ? false : Boolean(own?.added) || mode === 'must'
    const fromRule = variety?.interval ? variety : category?.interval ? category : undefined
    const suggested = fromRule?.interval ?? task.interval
    const suggestedFrom = fromRule
      ? { source: fromRule === variety ? ('variety' as const) : ('category' as const), ai: fromRule.source === 'ai' }
      : task.interval
        ? { source: 'task' as const, ai: false }
        : undefined
    return {
      task,
      active,
      offered: !active && !own?.off && mode === 'optional',
      interval: own?.interval ?? suggested,
      suggested,
      suggestedFrom,
      own: Boolean(own),
    }
  })
}

const WINTER_MONTHS = [11, 12, 1, 2]

function monthOf(iso: string) {
  return Number(iso.slice(5, 7))
}

function addDays(iso: string, days: number) {
  const date = new Date(`${iso.slice(0, 10)}T12:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function firstOfNextMonth(iso: string) {
  const date = new Date(`${iso.slice(0, 10)}T12:00:00.000Z`)
  date.setUTCDate(1)
  date.setUTCMonth(date.getUTCMonth() + 1)
  return date.toISOString().slice(0, 10)
}

/** Days until the next one, counted from `onIso`: the winter interval from November to February. */
export function careInterval(rule: CareRule, onIso: string) {
  return rule.winterEveryDays && WINTER_MONTHS.includes(monthOf(onIso)) ? rule.winterEveryDays : rule.everyDays
}

/** The next due day after care done on `fromIso`; a seasonal task skips ahead to its next active month. */
export function nextCareDue(rule: CareRule, fromIso: string) {
  let due = addDays(fromIso, careInterval(rule, fromIso))
  const months = rule.months
  if (months && months.length > 0 && months.length < 12) {
    for (let step = 0; step < 12 && !months.includes(monthOf(due)); step++) due = firstOfNextMonth(due)
  }
  return due
}

/** True when a seasonal task is resting on this day (feeding in winter). */
export function careResting(rule: CareRule, onIso: string) {
  return Boolean(rule.months && rule.months.length > 0 && !rule.months.includes(monthOf(onIso)))
}

/** Earliest day finished care of this kind may be logged on, given today. */
export function careFillFrom(kind: string, now: string) {
  return addDays(now, -careFillDays(kind))
}

function cleanDays(value: unknown) {
  const days = Number(value)
  return Number.isInteger(days) && days >= 1 && days <= 1095 ? days : undefined
}

/** An interval from a client or a form, or undefined when it is not a usable one. */
export function cleanInterval(value: unknown): CareRule | undefined {
  if (!value || typeof value !== 'object') return undefined
  const raw = value as Record<string, unknown>
  const everyDays = cleanDays(raw.everyDays)
  if (!everyDays) return undefined
  const rule: CareRule = { everyDays }
  const winter = cleanDays(raw.winterEveryDays)
  if (winter) rule.winterEveryDays = winter
  if (Array.isArray(raw.months)) {
    const months = [...new Set(raw.months.map(Number))].filter((m) => Number.isInteger(m) && m >= 1 && m <= 12)
    if (months.length > 0 && months.length < 12) rule.months = months.sort((a, b) => a - b)
  }
  return rule
}

/** An owner's per-plant care from a client: known task ids only; undefined when nothing is left. */
export function cleanPlantCare(input: unknown, taskIds: string[]): PlantCare | undefined {
  if (!input || typeof input !== 'object') return undefined
  const care: PlantCare = {}
  for (const id of taskIds) {
    const raw = (input as Record<string, unknown>)[id]
    if (!raw || typeof raw !== 'object') continue
    const entry = raw as Record<string, unknown>
    const interval = cleanInterval(entry.interval)
    const next = {
      ...(interval ? { interval } : {}),
      ...(entry.off === true ? { off: true } : {}),
      ...(entry.added === true && entry.off !== true ? { added: true } : {}),
    }
    if (Object.keys(next).length > 0) care[id] = next
  }
  return Object.keys(care).length > 0 ? care : undefined
}

const ICONS = ['water', 'photo', 'feed', 'repot', 'rotate', 'mist', 'prune', 'clean', 'pest', 'sun'] as const
const AUDIENCES = ['all', 'linked', 'optional'] as const
const MODES = ['must', 'optional', 'off'] as const

/** A task id from a name: lowercase letters, digits and dashes. */
export function careTaskId(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32)
}

/**
 * The catalog's care tasks and rules from a client (the admin's catalog save): sane values, built-in tasks
 * kept, rules only for known tasks and categories, at most one rule per task and category / variety.
 */
export function cleanCareCatalog(
  tasksIn: unknown,
  rulesIn: unknown,
  known: { categoryIds: Set<string>; subcategoryIds: Set<string> },
): { careTasks: CareTask[]; careRules: CareTaskRule[] } {
  const careTasks: CareTask[] = []
  for (const raw of Array.isArray(tasksIn) ? tasksIn : []) {
    if (!raw || typeof raw !== 'object') continue
    const item = raw as Record<string, unknown>
    const id = typeof item.id === 'string' ? careTaskId(item.id) : ''
    const name = typeof item.name === 'string' ? item.name.trim().slice(0, 40) : ''
    if (!id || !name || careTasks.some((task) => task.id === id)) continue
    const interval = cleanInterval(item.interval)
    careTasks.push({
      id,
      name,
      nameHe: (typeof item.nameHe === 'string' && item.nameHe.trim().slice(0, 40)) || name,
      icon: (ICONS as readonly string[]).includes(item.icon as string) ? (item.icon as CareTask['icon']) : 'sun',
      audience: (AUDIENCES as readonly string[]).includes(item.audience as string) ? (item.audience as CareTask['audience']) : 'linked',
      ...(interval ? { interval } : {}),
      ...(BUILT_IN_TASKS.some((task) => task.id === id && task.builtIn) ? { builtIn: true } : {}),
    })
  }
  // Water and photo cannot be deleted.
  for (const task of BUILT_IN_TASKS) {
    if (task.builtIn && !careTasks.some((item) => item.id === task.id)) careTasks.unshift({ ...task })
  }
  const taskIds = new Set(careTasks.map((task) => task.id))
  const careRules: CareTaskRule[] = []
  for (const raw of Array.isArray(rulesIn) ? rulesIn : []) {
    if (!raw || typeof raw !== 'object') continue
    const item = raw as Record<string, unknown>
    const taskId = String(item.taskId ?? '')
    const categoryId = String(item.categoryId ?? '')
    const subcategoryId = typeof item.subcategoryId === 'string' && item.subcategoryId ? item.subcategoryId : undefined
    if (!taskIds.has(taskId) || !known.categoryIds.has(categoryId)) continue
    if (subcategoryId && !known.subcategoryIds.has(subcategoryId)) continue
    if (careRules.some((rule) => rule.taskId === taskId && rule.categoryId === categoryId && rule.subcategoryId === subcategoryId)) continue
    const interval = cleanInterval(item.interval)
    careRules.push({
      id: `${taskId}:${subcategoryId ?? categoryId}`,
      taskId,
      categoryId,
      ...(subcategoryId ? { subcategoryId } : {}),
      mode: (MODES as readonly string[]).includes(item.mode as string) ? (item.mode as CareTaskRule['mode']) : 'must',
      ...(interval ? { interval } : {}),
      source: item.source === 'ai' ? 'ai' : 'admin',
    })
  }
  return { careTasks, careRules }
}

/** A category's new AI rules replace its old AI rules; rules the admin set (source admin) stay and win. */
export function mergeAiRules(
  rules: CareTaskRule[],
  categoryId: string,
  incoming: Omit<CareTaskRule, 'id' | 'source'>[],
): CareTaskRule[] {
  const kept = rules.filter((rule) => rule.categoryId !== categoryId || rule.source === 'admin')
  const taken = new Set(
    kept.filter((rule) => rule.categoryId === categoryId).map((rule) => `${rule.taskId}:${rule.subcategoryId ?? ''}`),
  )
  const added = incoming
    .filter((rule) => !taken.has(`${rule.taskId}:${rule.subcategoryId ?? ''}`))
    .map((rule) => ({ ...rule, id: `${rule.taskId}:${rule.subcategoryId ?? rule.categoryId}`, source: 'ai' as const }))
  return [...kept, ...added]
}
