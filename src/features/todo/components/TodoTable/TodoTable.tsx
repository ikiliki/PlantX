import type { Plant, Todo } from '../../../../mock/types'
import { useI18n } from '../../../../i18n/I18nProvider'
import { canFillTodo, dueTodos, isFirstWaterTodo } from '../../todoSchedule'
import { Action, Name, Root, Row, Rows, Title } from './TodoTable.styles'

export function TodoTable({
  todos,
  plants,
  onOpen,
  limit = 4,
}: {
  todos: Todo[]
  plants: Plant[]
  onOpen: (todo: Todo) => void
  limit?: number
}) {
  const { t, tr } = useI18n()
  const due = dueTodos(todos)
    .filter((todo) => canFillTodo(todo, todos))
    .slice(0, limit)

  if (plants.length === 0 || due.length === 0) return null

  return (
    <Root aria-label={t.todo.todayTitle}>
      <Title>{t.todo.todayTitle}</Title>
      <Rows>
        {due.map((todo) => {
          const plant = plants.find((item) => item.id === todo.plantId)
          const name = plant ? tr(plant.title, plant.titleHe) : todo.plantId
          const first = isFirstWaterTodo(todo, todos)
          const actionLabel =
            todo.subcategory === 'photo'
              ? t.todo.actionPhoto
              : first
                ? t.todo.actionSetWaterDate
                : t.todo.actionWater
          return (
            <Row key={todo.id}>
              <Name title={name}>{name}</Name>
              <Action type="button" onClick={() => onOpen(todo)}>
                {actionLabel}
              </Action>
            </Row>
          )
        })}
      </Rows>
    </Root>
  )
}
