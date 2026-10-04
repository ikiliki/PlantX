import { Link } from 'react-router-dom'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { Plant, Todo, TodoSubcategory } from '../../../../mock/types'
import { isFirstWaterTodo, isOpenTodo } from '../../todoSchedule'
import { TodoKindIcon } from '../TodoKindIcon/TodoKindIcon'
import { Block, Copy, Empty, Go, Kind, List, Root, Row } from './PassportTodo.styles'

function kindLabel(kind: TodoSubcategory, t: { actionWater: string; actionPhoto: string }) {
  return kind === 'photo' ? t.actionPhoto : t.actionWater
}

export function PassportTodo({
  plant,
  todos,
  careMark,
}: {
  plant: Plant
  todos: Todo[]
  careMark?: TodoSubcategory
}) {
  const { t } = useI18n()
  const plantTodos = todos.filter((todo) => todo.plantId === plant.id && todo.category === 'plant')
  const planned = plantTodos
    .filter(isOpenTodo)
    .sort((a, b) => (a.dueOn ?? '9999').localeCompare(b.dueOn ?? '9999') || a.subcategory.localeCompare(b.subcategory))
  const history = plantTodos
    .filter((todo) => todo.completedOn != null)
    .sort((a, b) => (b.completedOn ?? '').localeCompare(a.completedOn ?? ''))

  return (
    <Root>
      <Block>
        <h3>{t.passport.todoPlanned}</h3>
        {planned.length === 0 ? (
          <Empty>{t.passport.todoEmptyPlanned}</Empty>
        ) : (
          <List>
            {planned.map((todo) => {
              const first = isFirstWaterTodo(todo, plantTodos)
              const marked = careMark === todo.subcategory
              const when = first
                ? t.passport.todoFirstWater
                : t.passport.todoDue.replace('{day}', todo.dueOn ?? '—')
              // A planned task opens it on the Tasks page (that plant, its day).
              return (
                <li key={todo.id}>
                  <Row as={Link} to={`/tasks/${todo.id}`} $tone={todo.subcategory} $mark={marked}>
                    <Kind>
                      <TodoKindIcon kind={todo.subcategory} size={18} />
                    </Kind>
                    <Copy>
                      <strong>{kindLabel(todo.subcategory, t.todo)}</strong>
                      <span>{when}</span>
                    </Copy>
                    <Go aria-hidden>›</Go>
                  </Row>
                </li>
              )
            })}
          </List>
        )}
      </Block>

      <Block>
        <h3>{t.passport.todoHistory}</h3>
        {history.length === 0 ? (
          <Empty>{t.passport.todoEmptyHistory}</Empty>
        ) : (
          <List>
            {history.map((todo) => (
              <Row key={todo.id} $tone={todo.subcategory} $done $mark={careMark === todo.subcategory && todo.completedOn != null}>
                <Kind>
                  <TodoKindIcon kind={todo.subcategory} size={18} />
                </Kind>
                <Copy>
                  <strong>{kindLabel(todo.subcategory, t.todo)}</strong>
                  <span>{t.passport.todoDone.replace('{day}', todo.completedOn ?? '—')}</span>
                </Copy>
              </Row>
            ))}
          </List>
        )}
      </Block>
    </Root>
  )
}
