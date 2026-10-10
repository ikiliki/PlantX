import type { Plant, Todo, TodoSubcategory } from '../../mock/types'
import { isFirstWaterTodo, isOpenTodo } from '../todo/todoSchedule'

/**
 * The one line under a passport's name: care just completed (`done`), or the owner's next care (`next` / `clear`).
 */
export type PassportNowState =
  | { kind: 'done'; care: TodoSubcategory }
  | { kind: 'next'; todo: Todo; first: boolean }
  | { kind: 'clear' }

export function passportNow({
  plant,
  todos,
  isOwner,
  careOn,
  careMark,
}: {
  plant: Pick<Plant, 'id'>
  todos: Todo[]
  isOwner: boolean
  careOn: boolean
  careMark?: TodoSubcategory
}): PassportNowState | null {
  if (careMark) return { kind: 'done', care: careMark }
  if (!isOwner || !careOn) return null
  const plantTodos = todos.filter((todo) => todo.plantId === plant.id && todo.category === 'plant')
  // A first watering has no date yet and leads; then the earliest due.
  const open = plantTodos
    .filter(isOpenTodo)
    .sort((a, b) => (a.dueOn ?? '').localeCompare(b.dueOn ?? '') || a.subcategory.localeCompare(b.subcategory))
  const next = open[0]
  if (!next) return { kind: 'clear' }
  return { kind: 'next', todo: next, first: isFirstWaterTodo(next, plantTodos) }
}
