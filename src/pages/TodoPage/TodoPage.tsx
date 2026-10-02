import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { FeatureGate } from '../../components/FeatureGate/FeatureGate'
import { PageGate } from '../../components/PageGate/PageGate'
import { AuthPanel } from '../../features/auth/components/AuthPanel/AuthPanel'
import { AddPlantDialog } from '../../features/greenhouse/components/AddPlantDialog/AddPlantDialog'
import { TodoCalendar } from '../../features/todo/components/TodoCalendar/TodoCalendar'
import { needsFirstPlant, upcomingTodos } from '../../features/todo/todoSchedule'
import { forAudience } from '../../theme/audience'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import { useSectionFetch, useServerSlices } from '../../mock/useServerSlices'
import { GuestAuth, Heading, Page } from './TodoPage.styles'

export function TodoPage() {
  useServerSlices(['users', 'plants', 'todos', 'updates'])
  const { t } = useI18n()
  const { db, signedIn, completeTodo, sliceFailures } = useStore()
  const navigate = useNavigate()
  const { todoId } = useParams()
  const [params, setParams] = useSearchParams()
  const planned = params.get('view') === 'planned'
  const now = new Date()
  const [year, setYear] = useState(now.getUTCFullYear())
  const [month, setMonth] = useState(now.getUTCMonth())
  const [adding, setAdding] = useState(false)
  const plantsWaiting = useSectionFetch(signedIn, ['plants'])

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

  const firstPlant = signedIn && !plantsWaiting && !sliceFailures.plants && needsFirstPlant(plants, ownerId)

  // "Planned" from the Tasks menu: every upcoming task day selected, shown from the first one's month.
  const plannedDays = useMemo(
    () => [...new Set(upcomingTodos(todos).map((todo) => todo.dueOn as string))].sort(),
    [todos],
  )
  useEffect(() => {
    if (!planned || plannedDays.length === 0) return
    const first = new Date(`${plannedDays[0]}T12:00:00.000Z`)
    setYear(first.getUTCFullYear())
    setMonth(first.getUTCMonth())
  }, [planned, plannedDays])

  const board = (
    <Page>
      <Heading>
        <h1>{t.todo.title}</h1>
      </Heading>
      <TodoCalendar
        when={planned ? 'planned' : 'today'}
        onWhen={(next) => {
          const nextParams = new URLSearchParams(params)
          if (next === 'planned') nextParams.set('view', 'planned')
          else nextParams.delete('view')
          setParams(nextParams, { replace: true })
          if (next === 'today') {
            const now = new Date()
            setYear(now.getUTCFullYear())
            setMonth(now.getUTCMonth())
          }
        }}
        year={year}
        month={month}
        todos={todos}
        plants={plants}
        focusTodoId={todoId}
        firstPlant={firstPlant}
        showFilters={!plantsWaiting && !firstPlant}
        onAddFirstPlant={() => setAdding(true)}
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
      {adding ? <AddPlantDialog onClose={() => setAdding(false)} /> : null}
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
