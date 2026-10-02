import type { Plant, Todo, TodoSubcategory } from '../../mock/types'

export const WATER_GAP_DAYS = 7
export const PHOTO_GAP_MONTHS = 1

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
 * Days a care task may be logged on: today, and back through one category gap.
 * Water’s next task is a week later, so only the past week counts.
 * A photo’s next task is a month later, so only the past month counts.
 */
export function careFillWindow(subcategory: TodoSubcategory, now = todayIso()) {
  const min = subcategory === 'photo' ? addMonths(now, -PHOTO_GAP_MONTHS) : addDays(now, -WATER_GAP_DAYS)
  return { min, max: now }
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

/** Signed-in grower with no plants yet. The first-plant task is undated and mandatory. */
export function needsFirstPlant(plants: Plant[], ownerId: string | null) {
  if (!ownerId) return false
  return !plants.some((plant) => plant.ownerId === ownerId)
}

/**
 * Counts for the Tasks tab. `today`: due today or earlier, plus first waterings; an empty greenhouse
 * counts 1 (add your first plant). `planned`: scheduled after today. The tab label shows `today` only.
 */
export function taskTabCounts(todos: Todo[], plants: Plant[], ownerId: string | null, now = todayIso()) {
  if (!ownerId) return { today: 0, planned: 0 }
  const mine = todos.filter((todo) => todo.ownerId === ownerId)
  if (needsFirstPlant(plants, ownerId)) return { today: 1, planned: 0 }
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

export function plantHasUpcoming(todos: Todo[], plantId: string, now = todayIso()) {
  return upcomingTodos(todos, now).some((todo) => todo.plantId === plantId)
}

export function plantHasUpcomingWater(todos: Todo[], plantId: string, now = todayIso()) {
  return upcomingTodos(todos, now).some((todo) => todo.plantId === plantId && todo.subcategory === 'water')
}

export function plantHasUpcomingPhoto(todos: Todo[], plantId: string, now = todayIso()) {
  return upcomingTodos(todos, now).some((todo) => todo.plantId === plantId && todo.subcategory === 'photo')
}

type LegacyPlant = Plant & { wateredAt?: string; photoAt?: string }

/** Move legacy plant dates into todos and clear the dates. */
export function backfillTodos(plants: Plant[], todos: Todo[]): { plants: Plant[]; todos: Todo[] } {
  const rows = todos.slice()
  let changed = false
  const nextPlants = plants.map((plant) => {
    const legacy = plant as LegacyPlant
    if (plant.status === 'sold') {
      if (legacy.wateredAt == null && legacy.photoAt == null) return plant
      changed = true
      const { wateredAt: _w, photoAt: _p, ...rest } = legacy
      return rest
    }

    const hasWater = rows.some((row) => row.plantId === plant.id && row.subcategory === 'water')
    if (legacy.wateredAt && !hasWater) {
      const watered = legacy.wateredAt.slice(0, 10)
      rows.unshift({
        id: newId('todo'),
        ownerId: plant.ownerId,
        plantId: plant.id,
        category: 'plant',
        subcategory: 'water',
        dueOn: watered,
        completedOn: watered,
        createdAt: `${watered}T12:00:00.000Z`,
      })
      rows.unshift({
        id: newId('todo'),
        ownerId: plant.ownerId,
        plantId: plant.id,
        category: 'plant',
        subcategory: 'water',
        dueOn: addDays(watered, WATER_GAP_DAYS),
        completedOn: null,
        createdAt: new Date().toISOString(),
      })
      changed = true
    } else if (!hasWater) {
      rows.unshift({
        id: newId('todo'),
        ownerId: plant.ownerId,
        plantId: plant.id,
        category: 'plant',
        subcategory: 'water',
        dueOn: null,
        completedOn: null,
        createdAt: new Date().toISOString(),
      })
      changed = true
    }

    if (!openTodo(rows, plant.id, 'photo') && (legacy.photoAt || plant.photos.length > 0)) {
      const uploaded = (legacy.photoAt ?? plant.createdAt).slice(0, 10)
      rows.unshift({
        id: newId('todo'),
        ownerId: plant.ownerId,
        plantId: plant.id,
        category: 'plant',
        subcategory: 'photo',
        dueOn: addMonths(uploaded, PHOTO_GAP_MONTHS),
        completedOn: null,
        createdAt: new Date().toISOString(),
      })
      changed = true
    }

    if (legacy.wateredAt != null || legacy.photoAt != null) {
      changed = true
      const { wateredAt: _w, photoAt: _p, ...rest } = legacy
      return rest
    }
    return plant
  })

  return changed ? { plants: nextPlants, todos: rows } : { plants, todos }
}

export function ensureFirstWaterTodo(todos: Todo[], plant: Plant): Todo[] {
  if (todos.some((row) => row.plantId === plant.id && row.subcategory === 'water')) return todos
  return [
    {
      id: newId('todo'),
      ownerId: plant.ownerId,
      plantId: plant.id,
      category: 'plant',
      subcategory: 'water',
      dueOn: null,
      completedOn: null,
      createdAt: new Date().toISOString(),
    },
    ...todos,
  ]
}

export function schedulePhotoTodo(todos: Todo[], plant: Plant, uploadedOn = todayIso()): Todo[] {
  const dueOn = addMonths(uploadedOn, PHOTO_GAP_MONTHS)
  const open = openTodo(todos, plant.id, 'photo')
  if (open) {
    return todos.map((row) => (row.id === open.id ? { ...row, dueOn } : row))
  }
  return [
    {
      id: newId('todo'),
      ownerId: plant.ownerId,
      plantId: plant.id,
      category: 'plant',
      subcategory: 'photo',
      dueOn,
      completedOn: null,
      createdAt: new Date().toISOString(),
    },
    ...todos,
  ]
}
