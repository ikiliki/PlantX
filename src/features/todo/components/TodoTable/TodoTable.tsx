import type { Plant, Todo } from '../../../../mock/types'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { canFillTodo, dueTodos, isFirstWaterTodo, todayIso } from '../../todoSchedule'
import { TodoKindIcon } from '../TodoKindIcon/TodoKindIcon'
import { Action, Badge, Copy, Count, Head, Name, Root, Row, Rows, Status, Thumb, Title } from './TodoTable.styles'

function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000)
}

/**
 * "Needs you today": one tappable row per task, with the plant photo, a water / photo badge,
 * how late it is, and the action. Home's rail (under the catalog) and the phone sheet share it.
 */
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
  const today = todayIso()
  const fillable = dueTodos(todos).filter((todo) => canFillTodo(todo, todos))
  const due = fillable.slice(0, limit)

  if (plants.length === 0 || due.length === 0) return null

  return (
    <Root aria-label={t.todo.todayTitle}>
      <Head>
        <Title>{t.todo.todayTitle}</Title>
        <Count>{fillable.length}</Count>
      </Head>
      <Rows>
        {due.map((todo, index) => {
          const plant = plants.find((item) => item.id === todo.plantId)
          const name = plant ? tr(plant.title, plant.titleHe) : todo.plantId
          const first = isFirstWaterTodo(todo, todos)
          const late = todo.dueOn ? daysBetween(todo.dueOn, today) : 0
          const status = first
            ? t.todo.statusFirstWater
            : late > 0
              ? t.todo.statusOverdue.replace('{n}', String(late))
              : t.todo.statusToday
          const kindName = todo.subcategory === 'photo' ? t.todo.kindPhoto : t.todo.kindWater
          const actionLabel =
            todo.subcategory === 'photo' ? t.todo.actionPhoto : first ? t.todo.actionSetWaterDate : t.todo.actionWater
          return (
            <li key={todo.id}>
              <Row
                type="button"
                $tone={todo.subcategory}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => onOpen(todo)}
                aria-label={`${name} · ${kindName} · ${status}`}
              >
                <Thumb>
                  {plant?.photos[0] ? <PlantImage src={plant.photos[0]} alt="" /> : null}
                  <Badge $tone={todo.subcategory} aria-hidden>
                    <TodoKindIcon kind={todo.subcategory} size={12} />
                  </Badge>
                </Thumb>
                <Copy>
                  <Name title={name}>{name}</Name>
                  <Status $late={late > 0 && !first}>
                    {kindName} · {status}
                  </Status>
                </Copy>
                <Action aria-hidden $tone={todo.subcategory}>
                  {actionLabel}
                </Action>
              </Row>
            </li>
          )
        })}
      </Rows>
    </Root>
  )
}
