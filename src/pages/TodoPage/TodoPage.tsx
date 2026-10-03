import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FeatureGate } from '../../components/FeatureGate/FeatureGate'
import { PageGate } from '../../components/PageGate/PageGate'
import { GuestCurtain } from '../../components/GuestCurtain/GuestCurtain'
import { GuestView } from '../../components/GuestView/GuestView'
import { TodoCalendar } from '../../features/todo/components/TodoCalendar/TodoCalendar'
import { needsFirstPlant } from '../../features/todo/todoSchedule'
import { forAudience } from '../../theme/audience'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import { useSectionFetch, useServerSlices } from '../../mock/useServerSlices'
import { Heading, Page } from './TodoPage.styles'

export function TodoPage() {
  useServerSlices(['users', 'plants', 'todos', 'updates'])
  const { t } = useI18n()
  const { db, signedIn, completeTodo, sliceFailures } = useStore()
  const navigate = useNavigate()
  const { todoId } = useParams()
  const now = new Date()
  const [year, setYear] = useState(now.getUTCFullYear())
  const [month, setMonth] = useState(now.getUTCMonth())
  // Add Plant lives on the greenhouse: go there and open it, so the new plant lands where it shows.
  const openAddPlant = () => navigate('/greenhouse?add=1')
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

  const board = (
    <Page>
      <Heading>
        <h1>{t.todo.title}</h1>
      </Heading>
      <TodoCalendar
        year={year}
        month={month}
        todos={todos}
        plants={plants}
        focusTodoId={todoId}
        firstPlant={firstPlant}
        showFilters={!plantsWaiting && !firstPlant}
        onAddFirstPlant={openAddPlant}
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
              <Heading>
                <h1>{t.todo.title}</h1>
              </Heading>
              {/* The real calendar with no tasks: nothing is fetched for a guest. */}
              <GuestCurtain
                card={
                  <GuestView
                    card
                    title={t.guest.tasksTitle}
                    body={t.guest.tasksBody}
                    action={t.guest.logIn}
                    secondary={{ label: t.guest.tryAddPlant, onClick: openAddPlant }}
                  />
                }
              >
                <TodoCalendar
                  year={year}
                  month={month}
                  todos={[]}
                  plants={[]}
                  firstPlant={false}
                  showFilters
                  onAddFirstPlant={() => undefined}
                  onMonthChange={() => undefined}
                  onComplete={() => undefined}
                  onPickFirstWater={() => undefined}
                />
              </GuestCurtain>
            </Page>
          ),
          signedIn: board,
        })}
      </FeatureGate>
    </PageGate>
  )
}
