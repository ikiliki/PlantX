import { useState } from 'react'
import { TodoDayPicker } from './TodoDayPicker'

export default {
  title: 'Features/Todo/TodoDayPicker',
  component: TodoDayPicker,
}

export const Picker = () => {
  const now = new Date()
  const [year, setYear] = useState(now.getUTCFullYear())
  const [month, setMonth] = useState(now.getUTCMonth())
  const [days, setDays] = useState<string[]>([])
  const today = new Date().toISOString().slice(0, 10)
  return (
    <TodoDayPicker
      year={year}
      month={month}
      today={today}
      selected={days}
      marks={new Set([today])}
      onMonthChange={(nextYear, nextMonth) => {
        setYear(nextYear)
        setMonth(nextMonth)
      }}
      onOk={setDays}
      onClose={() => undefined}
    />
  )
}

export const CareDay = () => {
  const now = new Date()
  const today = new Date().toISOString().slice(0, 10)
  const min = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 7)).toISOString().slice(0, 10)
  return (
    <TodoDayPicker
      year={now.getUTCFullYear()}
      month={now.getUTCMonth()}
      today={today}
      selected={[today]}
      marks={new Set()}
      single
      note="Only today and the past week. The next watering is a week after the day you pick."
      allow={(day) => day >= min && day <= today}
      onMonthChange={() => undefined}
      onOk={() => undefined}
      onClose={() => undefined}
    />
  )
}
