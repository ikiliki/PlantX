import { useState } from 'react'
import { TodoCalendar } from './TodoCalendar'
import { useStore } from '../../../../mock/store'

export default {
  title: 'Features/Todo/TodoCalendar',
  component: TodoCalendar,
}

export const Month = () => {
  const { db, currentUser } = useStore()
  const now = new Date()
  const [year, setYear] = useState(now.getUTCFullYear())
  const [month, setMonth] = useState(now.getUTCMonth())
  const ownerId = currentUser?.id ?? db.visitorId
  const plants = db.plants.filter((plant) => plant.ownerId === ownerId)
  const todos = db.todos.filter((todo) => todo.ownerId === ownerId)
  return (
    <TodoCalendar
      year={year}
      month={month}
      todos={todos}
      plants={plants}
      onMonthChange={(nextYear, nextMonth) => {
        setYear(nextYear)
        setMonth(nextMonth)
      }}
      onComplete={() => undefined}
      onPickFirstWater={() => undefined}
    />
  )
}
