import { Errors } from '../../lib/errors.ts'
import { getStore } from '../../db/index.ts'
import { activityService } from '../activity/activity.service.ts'
import type { Todo, TodoCategory, TodoInput, TodoSubcategory } from './todo.types.ts'

export const WATER_GAP_DAYS = 7
export const PHOTO_GAP_MONTHS = 1

function today() {
  return new Date().toISOString().slice(0, 10)
}

function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T12:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function addMonths(iso: string, months: number) {
  const date = new Date(`${iso}T12:00:00.000Z`)
  date.setUTCMonth(date.getUTCMonth() + months)
  return date.toISOString().slice(0, 10)
}

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function isOpen(todo: Todo) {
  return todo.completedOn == null
}

function openOf(rows: Todo[], plantId: string, subcategory: TodoSubcategory) {
  return rows.find(
    (row) => row.plantId === plantId && row.subcategory === subcategory && row.category === 'plant' && isOpen(row),
  )
}

function hasAnyWater(rows: Todo[], plantId: string) {
  return rows.some((row) => row.plantId === plantId && row.subcategory === 'water' && row.category === 'plant')
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

async function save(rows: Todo[]) {
  await getStore().todos.saveAll(rows)
}

function push(rows: Todo[], input: TodoInput): Todo {
  const row: Todo = {
    id: input.id ?? newId('todo'),
    ownerId: input.ownerId,
    plantId: input.plantId,
    category: input.category,
    subcategory: input.subcategory,
    dueOn: input.dueOn,
    completedOn: input.completedOn,
    createdAt: input.createdAt ?? new Date().toISOString(),
  }
  rows.unshift(row)
  return row
}

/** Keep a single open todo. The current row must already be completed. */
function placeOpen(
  rows: Todo[],
  input: { ownerId: string; plantId: string; subcategory: TodoSubcategory; dueOn: string },
) {
  const open = openOf(rows, input.plantId, input.subcategory)
  if (open) {
    open.dueOn = input.dueOn
    return open
  }
  return push(rows, {
    ownerId: input.ownerId,
    plantId: input.plantId,
    category: 'plant',
    subcategory: input.subcategory,
    dueOn: input.dueOn,
    completedOn: null,
  })
}

/**
 * Care todos for water and photo. Completing a water or photo todo also
 * writes the matching news activity and plant history.
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

  /** New plant with no water history: open a first-watering session. */
  async ensureFirstWater(plantId: string, ownerId: string) {
    const rows = await getStore().todos.list()
    if (hasAnyWater(rows, plantId)) return openOf(rows, plantId, 'water') ?? null
    const todo = push(rows, {
      ownerId,
      plantId,
      category: 'plant',
      subcategory: 'water',
      dueOn: null,
      completedOn: null,
    })
    await save(rows)
    return todo
  },

  /** After a photo upload, open or move the photo todo one month out. */
  async schedulePhoto(plantId: string, ownerId: string, uploadedOn = today()) {
    const rows = await getStore().todos.list()
    const dueOn = addMonths(uploadedOn, PHOTO_GAP_MONTHS)
    const open = openOf(rows, plantId, 'photo')
    if (open) {
      open.dueOn = dueOn
      await save(rows)
      return open
    }
    const todo = push(rows, {
      ownerId,
      plantId,
      category: 'plant',
      subcategory: 'photo',
      dueOn,
      completedOn: null,
    })
    await save(rows)
    return todo
  },

  /**
   * Complete an open todo.
   * First watering: `completedOn` is the day the owner picks on the calendar.
   * Other todos default to today.
   */
  async complete(todoId: string, userId: string, completedOn?: string) {
    const store = getStore()
    const rows = await store.todos.list()
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
    if (firstWater && !completedOn) throw Errors.invalid('First watering needs a calendar day')
    if (firstWater && completedOn > today()) throw Errors.invalid('First watering cannot be in the future')
    if (!firstWater && (todo.dueOn == null || todo.dueOn > today())) {
      throw Errors.invalid('Task can only be filled on or after its due day')
    }

    todo.completedOn = at
    if (todo.dueOn == null) todo.dueOn = at

    let activityInput: Parameters<typeof activityService.record>[0] | null = null

    if (todo.subcategory === 'water') {
      plant.history = [{ at, label: 'Watered', labelHe: 'הושקה' }, ...plant.history]
      activityInput = {
        kind: 'water',
        userId,
        plantId: plant.id,
        body: `Water confirmed on ${plant.title}.`,
        bodyHe: `השקיה אושרה ל־${plant.titleHe}.`,
      }
      placeOpen(rows, {
        ownerId: userId,
        plantId: plant.id,
        subcategory: 'water',
        dueOn: addDays(at, WATER_GAP_DAYS),
      })
    }

    if (todo.subcategory === 'photo') {
      plant.history = [{ at, label: 'Photo refreshed', labelHe: 'התמונה רועננה' }, ...plant.history]
      activityInput = {
        kind: 'photo',
        userId,
        plantId: plant.id,
        body: `${plant.title} photo refreshed.`,
        bodyHe: `תמונת ${plant.titleHe} רועננה.`,
      }
      placeOpen(rows, {
        ownerId: userId,
        plantId: plant.id,
        subcategory: 'photo',
        dueOn: addMonths(at, PHOTO_GAP_MONTHS),
      })
    }

    // Todos first. A unique-index failure must not leave a watering that never completed.
    await save(rows)
    await store.plants.saveAll(plants)
    const activity = activityInput ? await activityService.record(activityInput) : null
    return {
      todo,
      todos: await todoService.list({ ownerId: userId }),
      plant,
      activity,
    }
  },

  /**
   * One-time move from plant.wateredAt / plant.photoAt into todos.
   * Clears those fields on the plant afterward.
   */
  async backfillFromPlants() {
    const store = getStore()
    const plants = await store.plants.list()
    const rows = await store.todos.list()
    let changed = false
    type LegacyPlant = (typeof plants)[number] & { wateredAt?: string; photoAt?: string }

    for (const plant of plants as LegacyPlant[]) {
      if (plant.status === 'sold') {
        if (plant.wateredAt != null || plant.photoAt != null) {
          delete plant.wateredAt
          delete plant.photoAt
          changed = true
        }
        continue
      }

      if (plant.wateredAt && !hasAnyWater(rows, plant.id)) {
        const watered = plant.wateredAt.slice(0, 10)
        push(rows, {
          ownerId: plant.ownerId,
          plantId: plant.id,
          category: 'plant' satisfies TodoCategory,
          subcategory: 'water' satisfies TodoSubcategory,
          dueOn: watered,
          completedOn: watered,
          createdAt: `${watered}T12:00:00.000Z`,
        })
        push(rows, {
          ownerId: plant.ownerId,
          plantId: plant.id,
          category: 'plant',
          subcategory: 'water',
          dueOn: addDays(watered, WATER_GAP_DAYS),
          completedOn: null,
        })
        changed = true
      } else if (!hasAnyWater(rows, plant.id)) {
        push(rows, {
          ownerId: plant.ownerId,
          plantId: plant.id,
          category: 'plant',
          subcategory: 'water',
          dueOn: null,
          completedOn: null,
        })
        changed = true
      }

      if (!openOf(rows, plant.id, 'photo') && (plant.photoAt || plant.photos.length > 0)) {
        const uploaded = (plant.photoAt ?? plant.createdAt).slice(0, 10)
        push(rows, {
          ownerId: plant.ownerId,
          plantId: plant.id,
          category: 'plant',
          subcategory: 'photo',
          dueOn: addMonths(uploaded, PHOTO_GAP_MONTHS),
          completedOn: null,
        })
        changed = true
      }

      if (plant.wateredAt != null || plant.photoAt != null) {
        delete plant.wateredAt
        delete plant.photoAt
        changed = true
      }
    }

    if (!changed) return { plants: 0, todos: rows.length }
    await store.plants.saveAll(plants)
    await save(rows)
    return { plants: plants.length, todos: rows.length }
  },
}
