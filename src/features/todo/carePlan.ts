import type { Catalog, CarePlan, CareRule, Plant, TodoSubcategory } from '../../mock/types'

/**
 * Care plans: how often each kind of care repeats for a plant. Shared by the server (scheduling) and the
 * browser (passport care plan, mock mode). Pure, no React.
 *
 * A plant's rule for a kind is the first one set on: the plant (the owner's own), its variety, its
 * category, then `DEFAULT_CARE`. `null` at any level turns that kind off for the plant.
 */

export const CARE_KINDS: TodoSubcategory[] = ['water', 'photo', 'feed', 'repot', 'rotate']

/** Rotate is off unless the catalog (or the owner) turns it on: only some plants lean to the light. */
export const DEFAULT_CARE: Record<TodoSubcategory, CareRule | null> = {
  water: { everyDays: 7, winterEveryDays: 12 },
  photo: { everyDays: 30 },
  feed: { everyDays: 30, months: [3, 4, 5, 6, 7, 8, 9] },
  repot: { everyDays: 365 },
  rotate: null,
}

/** How many days back finished care may be logged, per kind (plus today). */
export const CARE_FILL_DAYS: Record<TodoSubcategory, number> = {
  water: 7,
  photo: 31,
  feed: 30,
  repot: 60,
  rotate: 14,
}

/** The plant history line finished care adds. */
export const CARE_HISTORY: Record<TodoSubcategory, { label: string; labelHe: string }> = {
  water: { label: 'Watered', labelHe: 'הושקה' },
  photo: { label: 'Photo refreshed', labelHe: 'התמונה רועננה' },
  feed: { label: 'Fed', labelHe: 'קיבל דשן' },
  repot: { label: 'Repotted', labelHe: 'הועבר לעציץ חדש' },
  rotate: { label: 'Turned to the light', labelHe: 'סובב לאור' },
}

/** Intervals the owner can pick for one kind, in days. */
export const CARE_INTERVAL_CHOICES: Record<TodoSubcategory, number[]> = {
  water: [2, 3, 4, 5, 7, 10, 14, 21],
  photo: [14, 30, 60],
  feed: [14, 30, 60],
  repot: [180, 365, 730],
  rotate: [7, 14, 30],
}

export type CareSource = 'plant' | 'variety' | 'category' | 'default'
export type EffectiveCare = { kind: TodoSubcategory; rule: CareRule | null; source: CareSource }

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

/** Every kind's rule for this plant, and where it came from. */
export function careFor(
  plant: Pick<Plant, 'speciesId' | 'subcategoryId' | 'care'>,
  catalog: Pick<Catalog, 'categories' | 'subcategories'>,
): EffectiveCare[] {
  const category = catalog.categories.find((item) => item.speciesId === plant.speciesId)
  const variety = plant.subcategoryId ? catalog.subcategories.find((item) => item.id === plant.subcategoryId) : undefined
  const levels: [CareSource, CarePlan | undefined][] = [
    ['plant', plant.care],
    ['variety', variety?.care],
    ['category', category?.care],
  ]
  return CARE_KINDS.map((kind) => {
    for (const [source, plan] of levels) {
      if (plan && kind in plan) return { kind, rule: plan[kind] ?? null, source }
    }
    return { kind, rule: DEFAULT_CARE[kind], source: 'default' as const }
  })
}

export function careRuleFor(
  plant: Pick<Plant, 'speciesId' | 'subcategoryId' | 'care'>,
  catalog: Pick<Catalog, 'categories' | 'subcategories'>,
  kind: TodoSubcategory,
): CareRule | null {
  return careFor(plant, catalog).find((item) => item.kind === kind)?.rule ?? null
}

/** Days until the next one, counted from `onIso`: the winter interval from November to February. */
export function careInterval(rule: CareRule, onIso: string) {
  return rule.winterEveryDays && WINTER_MONTHS.includes(monthOf(onIso)) ? rule.winterEveryDays : rule.everyDays
}

/** The next due day after care done on `fromIso`; a seasonal kind skips ahead to its next active month. */
export function nextCareDue(rule: CareRule, fromIso: string) {
  let due = addDays(fromIso, careInterval(rule, fromIso))
  const months = rule.months
  if (months && months.length > 0 && months.length < 12) {
    for (let step = 0; step < 12 && !months.includes(monthOf(due)); step++) due = firstOfNextMonth(due)
  }
  return due
}

/** True when a seasonal kind is resting on this day (feeding in winter). */
export function careResting(rule: CareRule, onIso: string) {
  return Boolean(rule.months && rule.months.length > 0 && !rule.months.includes(monthOf(onIso)))
}

/** Earliest day finished care of this kind may be logged on, given today. */
export function careFillFrom(kind: TodoSubcategory, now: string) {
  return addDays(now, -CARE_FILL_DAYS[kind])
}

function cleanDays(value: unknown) {
  const days = Number(value)
  return Number.isInteger(days) && days >= 1 && days <= 730 ? days : undefined
}

function cleanRule(value: unknown): CareRule | null | undefined {
  if (value === null) return null
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

/** A care plan from a client or a form: known kinds only, sane numbers; `undefined` when nothing is left. */
export function cleanCarePlan(input: unknown): CarePlan | undefined {
  if (!input || typeof input !== 'object') return undefined
  const plan: CarePlan = {}
  for (const kind of CARE_KINDS) {
    if (!(kind in (input as object))) continue
    const rule = cleanRule((input as Record<string, unknown>)[kind])
    if (rule !== undefined) plan[kind] = rule
  }
  return Object.keys(plan).length > 0 ? plan : undefined
}
