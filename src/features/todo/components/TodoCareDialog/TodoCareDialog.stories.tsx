import { TodoCareDialog } from './TodoCareDialog'
import { useStore } from '../../../../mock/store'
import { dueTodos } from '../../todoSchedule'

export default {
  title: 'Features/Todo/TodoCareDialog',
  component: TodoCareDialog,
}

export const Open = () => {
  const { db, currentUser } = useStore()
  const ownerId = currentUser?.id ?? db.visitorId
  const todos = dueTodos(db.todos.filter((todo) => todo.ownerId === ownerId))
  const todo = todos[0]
  const plant = todo ? db.plants.find((item) => item.id === todo.plantId) : undefined
  if (!todo || !plant) return <p>No due todo</p>
  return (
    <TodoCareDialog
      todo={todo}
      plant={plant}
      todos={db.todos}
      onClose={() => undefined}
      onComplete={() => undefined}
      onPickFirstWater={() => undefined}
    />
  )
}
