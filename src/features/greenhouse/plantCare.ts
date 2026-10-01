import type { Plant, Todo } from '../../mock/types'
import { plantHasPhotoDue, plantHasWaterDue, plantNeedsCare } from '../todo/todoSchedule'

/** Open water or photo todos that are due. */
export function isPhotoStale(plant: Plant, todos: Todo[] = [], now = Date.now()) {
  const day = new Date(now).toISOString().slice(0, 10)
  return plantHasPhotoDue(todos, plant.id, day)
}

export function isWaterDue(plant: Plant, todos: Todo[] = [], now = Date.now()) {
  const day = new Date(now).toISOString().slice(0, 10)
  return plantHasWaterDue(todos, plant.id, day)
}

export function needsCare(plant: Plant, todos: Todo[] = [], now = Date.now()) {
  const day = new Date(now).toISOString().slice(0, 10)
  return plantNeedsCare(todos, plant.id, day)
}
