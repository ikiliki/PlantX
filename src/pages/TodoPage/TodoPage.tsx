import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FeatureGate } from '../../components/FeatureGate/FeatureGate'
import { PageGate } from '../../components/PageGate/PageGate'
import { AuthPanel } from '../../features/auth/components/AuthPanel/AuthPanel'
import { TodoCalendar } from '../../features/todo/components/TodoCalendar/TodoCalendar'
import { forAudience } from '../../theme/audience'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import { useServerSlices } from '../../mock/useServerSlices'
import { Description, Eyebrow, GuestAuth, Heading, Page } from './TodoPage.styles'

export function TodoPage() {
  useServerSlices(['users', 'plants', 'todos', 'updates'])
  const { t } = useI18n()
  const { db, signedIn, completeTodo } = useStore()
  const navigate = useNavigate()
  const { todoId } = useParams()
  const now = new Date()
  const [year, setYear] = useState(now.getUTCFullYear())
  const [month, setMonth] = useState(now.getUTCMonth())

  const ownerId = db.currentUserId
  const todos = useMemo(
    () => (ownerId ? db.todos.filter((todo) => todo.ownerId === ownerId) : []),
    [db.todos, ownerId],
  )
  const plants = useMemo(
    () => (ownerId ? db.plants.filter((plant) => plant.ownerId === ownerId) : []),
    [db.plants, ownerId],
  )

  useEffect(() => {
    if (!todoId) return
    const todo = todos.find((row) => row.id === todoId)
    if (!todo) return
    const due = todo.dueOn ?? new Date().toISOString().slice(0, 10)
    const date = new Date(`${due}T12:00:00.000Z`)
    setYear(date.getUTCFullYear())
    setMonth(date.getUTCMonth())
  }, [todoId, todos])

  const board = (
    <Page>
      <Heading>
        <Eyebrow>{t.todo.eyebrow}</Eyebrow>
        <h1>{t.todo.title}</h1>
        <Description>{t.todo.description}</Description>
      </Heading>
      <TodoCalendar
        year={year}
        month={month}
        todos={todos}
        plants={plants}
        focusTodoId={todoId}
        onMonthChange={(nextYear, nextMonth) => {
          setYear(nextYear)
          setMonth(nextMonth)
        }}
        onComplete={(todo) => {
          completeTodo(todo.id)
          navigate('/tasks', { replace: true })
        }}
        onPickFirstWater={(todo, day) => {
          completeTodo(todo.id, day)
          navigate('/tasks', { replace: true })
        }}
      />
    </Page>
  )

  return (
    <PageGate pageId="todo" title={t.todo.title}>
      <FeatureGate placement="todo.board" title={t.todo.title}>
        {forAudience(signedIn, {
          guest: (
            <Page>
              <GuestAuth>
                <AuthPanel
                  reason="buy"
                  dialog
                  titleId="todo-auth-title"
                  onSuccess={() => navigate('/tasks', { replace: true })}
                />
              </GuestAuth>
            </Page>
          ),
          signedIn: board,
        })}
      </FeatureGate>
    </PageGate>
  )
}
