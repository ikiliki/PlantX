import { analyticsService } from '../analytics/analytics.service.ts'
import { changedSince, snapshot } from '../../lib/changedRows.ts'
import { Errors } from '../../lib/errors.ts'
import { getStore } from '../../db/index.ts'
import { activityService } from '../activity/activity.service.ts'
import { catalogService } from '../catalog/catalog.service.ts'
import { careFillFrom, careHistory } from '../../../../src/features/todo/carePlan.ts'
import { syncCareTodos } from '../../../../src/features/todo/todoSchedule.ts'
import type { Plant } from '../../../../src/mock/types.ts'
import type { Todo } from './todo.types.ts'

function today() {
  return new Date().toISOString().slice(0, 10)
}

function isOpen(todo: Todo) {
  return todo.completedOn == null
}

/** First watering still needs a calendar pick. */
export function isFirstWaterTodo(todo: Todo, rows: Todo[]) {
  if (todo.category !== 'plant' || todo.subcategory !== 'water' || !isOpen(todo)) return false
  if (todo.dueOn != null) return false
  return !rows.some(
    (row) =>
      row.plantId === todo.plantId &&
      row.subcategory === 'water' &&
      row.category === 'plant' &&
      row.completedOn != null,
  )
}

/** Only the todos changed since `before` (the snapshot taken after list) are written. */
async function save(rows: Todo[], before: Map<string, string>) {
  const changed = changedSince(before, rows)
  if (changed.length) await getStore().todos.upsert(changed)
}

/** Brings one plant's open tasks in line with its care plan and writes the difference. */
async function syncPlant(plant: Plant, move: boolean) {
  const store = getStore()
  const [rows, catalog] = await Promise.all([store.todos.list(), catalogService.get()])
  const before = snapshot(rows)
  const { todos, removed } = syncCareTodos(rows, plant, catalog, { move })
  await store.todos.remove(removed)
  await save(todos, before)
}

/**
 * Care tasks. Each plant has one open task per kind of care its plan turns on (`careFor`: the owner's,
 * the variety's, the category's, or the default). Completing one schedules the next from that plan.
 * Water and photo also write a feed activity; every kind writes plant history and counts for XP.
 */
export const todoService = {
  async list(query: { ownerId?: string; plantId?: string; open?: boolean } = {}) {
    let rows = await getStore().todos.list()
    if (query.ownerId) rows = rows.filter((row) => row.ownerId === query.ownerId)
    if (query.plantId) rows = rows.filter((row) => row.plantId === query.plantId)
    if (query.open) rows = rows.filter(isOpen)
    return rows.slice().sort((a, b) => {
      const aDue = a.dueOn ?? a.createdAt
      const bDue = b.dueOn ?? b.createdAt
      return aDue.localeCompare(bDue) || a.createdAt.localeCompare(b.createdAt)
    })
  },

  async get(id: string) {
    const todo = (await getStore().todos.list()).find((row) => row.id === id)
    if (!todo) throw Errors.missing(`Todo ${id} not found`)
    return todo
  },

  /** A new plant: a first-watering session, then every other kind of care its plan turns on. */
  async planCare(plant: Plant) {
    await syncPlant(plant, false)
  },

  /** The owner changed the plant's care: due days move to the new intervals, paused kinds lose their task. */
  async replanCare(plant: Plant) {
    await syncPlant(plant, true)
  },

  /**
   * Complete an open todo.
   * First watering: `completedOn` is the day the owner picks on the calendar.
   * Other todos default to today.
   */
  async complete(todoId: string, userId: string, completedOn?: string) {
    const store = getStore()
    const rows = await store.todos.list()
    const before = snapshot(rows)
    const todo = rows.find((row) => row.id === todoId)
    if (!todo) throw Errors.missing(`Todo ${todoId} not found`)
    if (todo.ownerId !== userId) throw Errors.forbidden('Todo belongs to another owner')
    if (!isOpen(todo)) throw Errors.invalid('Todo is already completed')

    const plants = await store.plants.list()
    const plant = plants.find((item) => item.id === todo.plantId && item.ownerId === userId)
    if (!plant) throw Errors.missing(`Plant ${todo.plantId} not found for owner`)
    if (plant.status === 'sold') throw Errors.invalid('Sold plants do not take care todos')

    const firstWater = isFirstWaterTodo(todo, rows)
    const at = completedOn ?? today()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(at)) throw Errors.invalid('completedOn must be YYYY-MM-DD')
    if (at < careFillFrom(todo.subcategory, today()) || at > today()) {
      throw Errors.invalid('Care day is outside this category’s window')
    }
    if (firstWater && !completedOn) throw Errors.invalid('First watering needs a calendar day')
    if (!firstWater && (todo.dueOn == null || todo.dueOn > today())) {
      throw Errors.invalid('Task can only be filled on or after its due day')
    }

    todo.completedOn = at
    if (todo.dueOn == null) todo.dueOn = at
    const catalog = await catalogService.get()
    const task = catalog.careTasks.find((item) => item.id === todo.subcategory) ?? {
      id: todo.subcategory,
      name: todo.subcategory,
      nameHe: todo.subcategory,
    }
    plant.history = [{ at, ...careHistory(task) }, ...plant.history]

    const activityInput: Parameters<typeof activityService.record>[0] | null =
      todo.subcategory === 'water'
        ? {
            kind: 'water',
            userId,
            plantId: plant.id,
            body: `Water confirmed on ${plant.title}.`,
            bodyHe: `השקיה אושרה ל־${plant.titleHe}.`,
          }
        : todo.subcategory === 'photo'
          ? {
              kind: 'photo',
              userId,
              plantId: plant.id,
              body: `${plant.title} photo refreshed.`,
              bodyHe: `תמונת ${plant.titleHe} רועננה.`,
            }
          : null

    // The finished task closes first, then the plan opens the next one. todos_open_unique allows one open per kind.
    const next = syncCareTodos(rows, plant, catalog)
    await store.todos.remove(next.removed)
    await save(next.todos, before)
    await store.plants.upsert([plant])
    const activity = activityInput ? await activityService.record(activityInput) : null
    await analyticsService.trackFirst('care_done', userId, { kind: todo.subcategory })
    return {
      todo,
      todos: await todoService.list({ ownerId: userId }),
      plant,
      activity,
    }
  },

  /**
   * Every unsold plant has the open tasks its care plan asks for: at start (`move` off: only missing tasks),
   * and after the admin changes care in the catalog (`move` on: due days follow the new intervals).
   */
  async ensureCareTodos({ move = false }: { move?: boolean } = {}) {
    const store = getStore()
    const [plants, rows, catalog] = await Promise.all([store.plants.list(), store.todos.list(), catalogService.get()])
    const before = snapshot(rows)
    let current = rows
    const removed: string[] = []
    for (const plant of plants) {
      const next = syncCareTodos(current, plant, catalog, { move })
      current = next.todos
      removed.push(...next.removed)
    }
    const added = current.length - rows.length + removed.length
    await store.todos.remove(removed)
    await save(current, before)
    return { added }
  },
}
