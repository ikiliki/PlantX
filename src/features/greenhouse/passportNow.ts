import type { FeedUpdate, Plant, Todo, TodoSubcategory } from '../../mock/types'
import { isFirstWaterTodo, isOpenTodo } from '../todo/todoSchedule'

/**
 * The one line under a passport's name that says why it is open or what comes next.
 * `done`: care was just completed. `moment`: opened from an activity. `next` / `clear`: the owner's next care.
 */
export type PassportNowState =
  | { kind: 'done'; care: TodoSubcategory }
  | { kind: 'moment'; update: FeedUpdate }
  | { kind: 'next'; todo: Todo; first: boolean }
  | { kind: 'clear' }

export function passportNow({
  plant,
  todos,
  updates,
  isOwner,
  careOn,
  careMark,
  activityKey,
}: {
  plant: Pick<Plant, 'id'>
  todos: Todo[]
  updates: FeedUpdate[]
  isOwner: boolean
  careOn: boolean
  careMark?: TodoSubcategory
  activityKey?: string
}): PassportNowState | null {
  if (careMark) return { kind: 'done', care: careMark }
  const update = activityKey ? updates.find((item) => item.id === activityKey && item.plantId === plant.id) : undefined
  if (update) return { kind: 'moment', update }
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
