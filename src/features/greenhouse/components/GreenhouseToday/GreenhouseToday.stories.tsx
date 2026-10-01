import { TodoTable } from '../../../todo/components/TodoTable/TodoTable'
import { useStore } from '../../../../mock/store'
import { dueTodos } from '../../../todo/todoSchedule'

export default {
  title: 'Features/Greenhouse/GreenhouseToday',
  component: TodoTable,
}

export const Due = () => {
  const { db, currentUser } = useStore()
  const ownerId = currentUser?.id ?? db.visitorId
  const plants = db.plants.filter((plant) => plant.ownerId === ownerId)
  const todos = dueTodos(db.todos.filter((todo) => todo.ownerId === ownerId))
  return <TodoTable todos={todos} plants={plants} onOpen={() => undefined} />
}
