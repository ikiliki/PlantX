import type { Catalog, Plant, Todo, TodoSubcategory } from '../../mock/types'
import { careFillFrom, careFor, nextCareDue } from './carePlan'

export function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T12:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function addMonths(iso: string, months: number) {
  const date = new Date(`${iso}T12:00:00.000Z`)
  date.setUTCMonth(date.getUTCMonth() + months)
  return date.toISOString().slice(0, 10)
}

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function isOpenTodo(todo: Todo) {
  return todo.completedOn == null
}

export function openTodo(todos: Todo[], plantId: string, subcategory: TodoSubcategory) {
  return todos.find(
    (row) => row.plantId === plantId && row.subcategory === subcategory && row.category === 'plant' && isOpenTodo(row),
  )
}

export function isFirstWaterTodo(todo: Todo, todos: Todo[]) {
  if (todo.category !== 'plant' || todo.subcategory !== 'water' || !isOpenTodo(todo)) return false
  if (todo.dueOn != null) return false
  return !todos.some(
    (row) =>
      row.plantId === todo.plantId &&
      row.subcategory === 'water' &&
      row.category === 'plant' &&
      row.completedOn != null,
  )
}

/**
 * Days a care task may be logged on: today, and back through that kind's window
 * (water the past week, a photo or feeding the past month; see `CARE_FILL_DAYS`).
 */
export function careFillWindow(subcategory: TodoSubcategory, now = todayIso()) {
  return { min: careFillFrom(subcategory, now), max: now }
}

export function inCareFillWindow(day: string, subcategory: TodoSubcategory, now = todayIso()) {
  const { min, max } = careFillWindow(subcategory, now)
  return day >= min && day <= max
}

/** First watering anytime inside the window; scheduled tasks only on or after their due day (not early). */
export function canFillTodo(todo: Todo, todos: Todo[], now = todayIso()) {
  if (!isOpenTodo(todo)) return false
  if (isFirstWaterTodo(todo, todos)) return true
  if (todo.dueOn == null) return false
  return todo.dueOn <= now
}

/** An undated task that is not a first watering: the owner still has to set how often ("Set schedule"). */
export function isSetTodo(todo: Todo, todos: Todo[]) {
  return isOpenTodo(todo) && todo.dueOn == null && !isFirstWaterTodo(todo, todos)
}

/** Signed-in grower with no plants yet. The first-plant task is undated and mandatory. */
export function needsFirstPlant(plants: Plant[], ownerId: string | null) {
  if (!ownerId) return false
  return !plants.some((plant) => plant.ownerId === ownerId)
}

/**
 * Counts for the Tasks tab: real open tasks only. `today`: due today or earlier, plus first waterings.
 * `planned`: scheduled after today. An empty greenhouse counts 0; the Tasks page shows the add-plant card.
 */
export function taskTabCounts(todos: Todo[], ownerId: string | null, now = todayIso()) {
  if (!ownerId) return { today: 0, planned: 0 }
  const mine = todos.filter((todo) => todo.ownerId === ownerId)
  return { today: dueTodos(mine, now).length, planned: upcomingTodos(mine, now).length }
}

/** Open todos that need attention today or earlier, plus first-watering sessions. */
export function dueTodos(todos: Todo[], now = todayIso()) {
  return todos.filter((todo) => {
    if (!isOpenTodo(todo)) return false
    if (todo.dueOn == null) return true
    return todo.dueOn <= now
  })
}

/** Open todos scheduled after today. */
export function upcomingTodos(todos: Todo[], now = todayIso()) {
  return todos.filter((todo) => isOpenTodo(todo) && todo.dueOn != null && todo.dueOn > now)
}

/** Todos the owner can act on right now (due today/earlier, or first watering). */
export function fillableTodos(todos: Todo[], now = todayIso()) {
  return todos.filter((todo) => canFillTodo(todo, todos, now))
}

export function plantNeedsCare(todos: Todo[], plantId: string, now = todayIso()) {
  return dueTodos(todos, now).some((todo) => todo.plantId === plantId)
}

export function plantHasWaterDue(todos: Todo[], plantId: string, now = todayIso()) {
  return dueTodos(todos, now).some((todo) => todo.plantId === plantId && todo.subcategory === 'water')
}

export function plantHasPhotoDue(todos: Todo[], plantId: string, now = todayIso()) {
  return dueTodos(todos, now).some((todo) => todo.plantId === plantId && todo.subcategory === 'photo')
}

/** Due today or earlier for any of these kinds. */
export function plantHasDueKinds(todos: Todo[], plantId: string, kinds: TodoSubcategory[], now = todayIso()) {
  return dueTodos(todos, now).some((todo) => todo.plantId === plantId && kinds.includes(todo.subcategory))
}

/** Scheduled after today for any of these kinds. */
export function plantHasUpcomingKinds(todos: Todo[], plantId: string, kinds: TodoSubcategory[], now = todayIso()) {
  return upcomingTodos(todos, now).some((todo) => todo.plantId === plantId && kinds.includes(todo.subcategory))
}

export function plantHasUpcoming(todos: Todo[], plantId: string, now = todayIso()) {
  return upcomingTodos(todos, now).some((todo) => todo.plantId === plantId)
}

export function plantHasUpcomingWater(todos: Todo[], plantId: string, now = todayIso()) {
  return upcomingTodos(todos, now).some((todo) => todo.plantId === plantId && todo.subcategory === 'water')
}

export function plantHasUpcomingPhoto(todos: Todo[], plantId: string, now = todayIso()) {
  return upcomingTodos(todos, now).some((todo) => todo.plantId === plantId && todo.subcategory === 'photo')
}

/** Seed-only care dates (mock demo), keyed by plant id. Plants themselves carry no care dates. */
export type CareDates = Record<string, { wateredAt?: string; photoAt?: string }>

type CarePlant = Pick<Plant, 'id' | 'ownerId' | 'speciesId' | 'subcategoryId' | 'care' | 'photos' | 'createdAt' | 'status'>

function lastDone(todos: Todo[], plantId: string, kind: TodoSubcategory) {
  let last: string | undefined
  for (const row of todos) {
    if (row.plantId !== plantId || row.subcategory !== kind || row.completedOn == null) continue
    if (!last || row.completedOn > last) last = row.completedOn
  }
  return last
}

function careTodo(plant: CarePlant, kind: TodoSubcategory, dueOn: string | null, completedOn: string | null = null): Todo {
  return {
    id: newId('todo'),
    ownerId: plant.ownerId,
    plantId: plant.id,
    category: 'plant',
    subcategory: kind,
    dueOn,
    completedOn,
    createdAt: new Date().toISOString(),
  }
}

/**
 * Makes a plant's open tasks match its care plan (`careFor`): one open task per task that applies, due one
 * interval after it was last done (or from today when it never was); a plant never watered gets a
 * first-watering session; a task with no interval anywhere gets an undated "Set schedule" task; a task that
 * no longer applies loses its open task; a photo task waits for a photo. Existing due days stay unless
 * `move` is set (the plan itself changed). Shared by the server and mock mode.
 */
export function syncCareTodos(
  todos: Todo[],
  plant: CarePlant,
  catalog: Pick<Catalog, 'categories' | 'careTasks' | 'careRules'>,
  { move = false }: { move?: boolean } = {},
): { todos: Todo[]; removed: string[] } {
  if (plant.status === 'sold') return { todos, removed: [] }
  let rows = todos
  const removed: string[] = []
  for (const { task, active, interval } of careFor(plant, catalog)) {
    const kind = task.id
    const open = openTodo(rows, plant.id, kind)
    if (!active) {
      if (open) {
        removed.push(open.id)
        rows = rows.filter((row) => row.id !== open.id)
      }
      continue
    }
    const done = lastDone(rows, plant.id, kind)
    if (kind === 'water' && !done) {
      if (!open) rows = [careTodo(plant, kind, null), ...rows]
      continue
    }
    if (kind === 'photo' && !open && plant.photos.length === 0) continue
    if (!interval) {
      // Nothing says how often: ask the owner with an undated task.
      if (!open) rows = [careTodo(plant, kind, null), ...rows]
      else if (open.dueOn != null) rows = rows.map((row) => (row.id === open.id ? { ...row, dueOn: null } : row))
      continue
    }
    // Never done: count from today (a task the owner just added, or the catalog just turned on), not from
    // the day the plant was added, which would make it overdue at once.
    const dueOn = nextCareDue(interval, done ?? todayIso())
    if (!open) rows = [careTodo(plant, kind, dueOn), ...rows]
    else if (open.dueOn == null || (move && open.dueOn !== dueOn)) {
      rows = rows.map((row) => (row.id === open.id ? { ...row, dueOn } : row))
    }
  }
  return { todos: rows, removed }
}

/** Gives every unsold plant its care plan's open tasks; `care` dates the demo ones (a watering, a photo). */
export function seedCareTodos(
  plants: Plant[],
  todos: Todo[],
  catalog: Pick<Catalog, 'categories' | 'careTasks' | 'careRules'>,
  care: CareDates = {},
): Todo[] {
  let rows = todos
  for (const plant of plants) {
    if (plant.status === 'sold') continue
    const dates = care[plant.id] ?? {}
    if (dates.wateredAt && !rows.some((row) => row.plantId === plant.id && row.subcategory === 'water')) {
      const watered = dates.wateredAt.slice(0, 10)
      rows = [careTodo(plant, 'water', watered, watered), ...rows]
    }
    if (dates.photoAt && !rows.some((row) => row.plantId === plant.id && row.subcategory === 'photo')) {
      const shot = dates.photoAt.slice(0, 10)
      rows = [careTodo(plant, 'photo', shot, shot), ...rows]
    }
    rows = syncCareTodos(rows, plant, catalog).todos
  }
  return rows
}
