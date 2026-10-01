import { plantHasPhotoDue, plantHasWaterDue } from '../todo/todoSchedule'
import type { Plant, Todo } from '../../mock/types'

export type GreenhouseNeed =
  | { kind: 'refresh'; plant: Plant; todo: Todo }
  | { kind: 'water'; plant: Plant; todo: Todo }
  | { kind: 'list'; plant: Plant }
  | { kind: 'add' }

/** Plants that still need a greenhouse action. Prefer open todos. */
export function greenhouseNeeds(plants: Plant[], todos: Todo[] = []): GreenhouseNeed[] {
  const living = plants.filter((plant) => plant.status !== 'sold')
  const open = todos.filter((todo) => todo.completedOn == null)
  const needs: GreenhouseNeed[] = []
  for (const plant of living) {
    const photo = open.find((todo) => todo.plantId === plant.id && todo.subcategory === 'photo')
    const water = open.find((todo) => todo.plantId === plant.id && todo.subcategory === 'water')
    if (photo && plantHasPhotoDue(todos, plant.id)) needs.push({ kind: 'refresh', plant, todo: photo })
    if (water && plantHasWaterDue(todos, plant.id)) needs.push({ kind: 'water', plant, todo: water })
    if (plant.status === 'owned') needs.push({ kind: 'list', plant })
  }
  if (needs.length > 0) return needs
  if (plants.length === 0) return [{ kind: 'add' }]
  return []
}
