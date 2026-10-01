import { TodoCareCard } from './TodoCareCard'
import { useStore } from '../../../../mock/store'
import { dueTodos } from '../../todoSchedule'

export default {
  title: 'Features/Todo/TodoCareCard',
  component: TodoCareCard,
}

export const Water = () => {
  const { db, currentUser } = useStore()
  const ownerId = currentUser?.id ?? db.visitorId
  const todos = dueTodos(db.todos.filter((todo) => todo.ownerId === ownerId && todo.subcategory === 'water'))
  const todo = todos[0]
  const plant = todo ? db.plants.find((item) => item.id === todo.plantId) : undefined
  if (!todo || !plant) return <p>No water todo</p>
  return (
    <TodoCareCard
      todo={todo}
      plant={plant}
      todos={db.todos}
      onComplete={() => undefined}
      onPickFirstWater={() => undefined}
    />
  )
}
