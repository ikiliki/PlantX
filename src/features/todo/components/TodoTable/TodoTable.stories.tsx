import { TodoTable } from './TodoTable'
import { useStore } from '../../../../mock/store'
import { dueTodos } from '../../todoSchedule'

export default {
  title: 'Features/Todo/TodoTable',
  component: TodoTable,
}

export const Due = () => {
  const { db, currentUser } = useStore()
  const ownerId = currentUser?.id ?? db.visitorId
  const plants = db.plants.filter((plant) => plant.ownerId === ownerId)
  const todos = dueTodos(db.todos.filter((todo) => todo.ownerId === ownerId))
  return <TodoTable todos={todos} plants={plants} onOpen={() => undefined} />
}
