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

export const FirstPlant = () => {
  const now = new Date()
  const [year, setYear] = useState(now.getUTCFullYear())
  const [month, setMonth] = useState(now.getUTCMonth())
  return (
    <TodoCalendar
      year={year}
      month={month}
      todos={[]}
      plants={[]}
      firstPlant
      showFilters={false}
      onAddFirstPlant={() => undefined}
      onMonthChange={(nextYear, nextMonth) => {
        setYear(nextYear)
        setMonth(nextMonth)
      }}
      onComplete={() => undefined}
      onPickFirstWater={() => undefined}
    />
  )
}

export const SeveralOnOneDay = () => {
  const { db, currentUser } = useStore()
  const now = new Date()
  const [year, setYear] = useState(now.getUTCFullYear())
  const [month, setMonth] = useState(now.getUTCMonth())
  const ownerId = currentUser?.id ?? db.visitorId
  const plants = db.plants.filter((plant) => plant.ownerId === ownerId)
  const day = new Date(Date.UTC(year, month, 8)).toISOString().slice(0, 10)
  const todos = db.todos
    .filter((todo) => todo.ownerId === ownerId)
    .slice(0, 4)
    .map((todo) => ({ ...todo, id: `${todo.id}-same-day`, dueOn: day, completedOn: null }))
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
