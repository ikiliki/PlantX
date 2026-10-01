import { useEffect, useMemo, useRef, useState } from 'react'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { PassportDialog } from '../../../greenhouse/components/PassportDialog/PassportDialog'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { Plant, Todo, TodoSubcategory } from '../../../../mock/types'
import { canFillTodo, isOpenTodo, todayIso } from '../../todoSchedule'
import { TodoCareCard } from '../TodoCareCard/TodoCareCard'
import { TodoKindIcon } from '../TodoKindIcon/TodoKindIcon'
import {
  Board,
  Cell,
  Chip,
  Day,
  DayList,
  DayNum,
  DayPanel,
  DayPanelHead,
  DropIcon,
  EmptyDay,
  FilterLabel,
  FilterRow,
  FilterSelect,
  Filters,
  Grid,
  Head,
  Icons,
  Month,
  Nav,
  PlantBtn,
  PlantKind,
  Root,
  Week,
} from './TodoCalendar.styles'

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6]
const ALL_KINDS: TodoSubcategory[] = ['water', 'photo']

function monthMatrix(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1))
  const start = (first.getUTCDay() + 6) % 7
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < start; i++) cells.push(null)
  for (let day = 1; day <= days; day++) cells.push(day)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function isoDay(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10)
}

function dayTone(items: Todo[]): 'water' | 'photo' | 'mixed' | undefined {
  if (items.length === 0) return undefined
  const water = items.some((todo) => todo.subcategory === 'water')
  const photo = items.some((todo) => todo.subcategory === 'photo')
  if (water && photo) return 'mixed'
  if (photo) return 'photo'
  return 'water'
}

function kindLabel(kind: TodoSubcategory, t: { actionWater: string; actionPhoto: string }) {
  return kind === 'photo' ? t.actionPhoto : t.actionWater
}

export function TodoCalendar({
  year,
  month,
  todos,
  plants,
  focusTodoId,
  onMonthChange,
  onComplete,
  onPickFirstWater,
}: {
  year: number
  month: number
  todos: Todo[]
  plants: Plant[]
  /** Deep link `/tasks/:id` — filters to that plant and selects its day. */
  focusTodoId?: string
  onMonthChange: (year: number, month: number) => void
  onComplete: (todo: Todo) => void
  onPickFirstWater: (todo: Todo, day: string) => void
}) {
  const { t, tr, locale } = useI18n()
  const open = todos.filter(isOpenTodo)
  const living = plants.filter((plant) => plant.status === 'owned' || plant.status === 'listed')
  const kinds = useMemo(() => {
    const present = new Set(open.map((todo) => todo.subcategory))
    return ALL_KINDS.filter((kind) => present.has(kind))
  }, [open])

  const [plantFilter, setPlantFilter] = useState<string | 'all'>('all')
  const [kindFilter, setKindFilter] = useState<TodoSubcategory | 'all'>('all')
  const [selectedDays, setSelectedDays] = useState<string[]>(() => [todayIso()])
  const [drop, setDrop] = useState<{ day: string; kind: TodoSubcategory; key: number } | undefined>()
  const [passport, setPassport] = useState<{ plantId: string; careMark: TodoSubcategory } | undefined>()
  const dropTimer = useRef<number | undefined>(undefined)
  const focusedRef = useRef<string | undefined>(undefined)

  const filtered = useMemo(() => {
    return open.filter((todo) => {
      if (plantFilter !== 'all' && todo.plantId !== plantFilter) return false
      if (kindFilter !== 'all' && todo.subcategory !== kindFilter) return false
      return true
    })
  }, [open, plantFilter, kindFilter])

  useEffect(() => {
    if (!focusTodoId || focusedRef.current === focusTodoId) return
    const todo = todos.find((row) => row.id === focusTodoId)
    if (!todo) return
    focusedRef.current = focusTodoId
    setPlantFilter(todo.plantId)
    const day = todo.dueOn ?? todayIso()
    setSelectedDays([day])
  }, [focusTodoId, todos])

  useEffect(() => {
    return () => {
      if (dropTimer.current) window.clearTimeout(dropTimer.current)
    }
  }, [])

  const byDay = new Map<string, Todo[]>()
  for (const todo of filtered) {
    const key = todo.dueOn ?? todayIso()
    const list = byDay.get(key) ?? []
    list.push(todo)
    byDay.set(key, list)
  }

  const label = new Date(Date.UTC(year, month, 1)).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

  const selectedTodos = selectedDays
    .flatMap((day) => byDay.get(day) ?? [])
    .sort((a, b) => (a.dueOn ?? '').localeCompare(b.dueOn ?? '') || a.subcategory.localeCompare(b.subcategory))

  const selectedLabel =
    selectedDays.length === 0
      ? t.todo.emptyDay
      : selectedDays.length === 1
        ? new Date(`${selectedDays[0]}T12:00:00.000Z`).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC',
          })
        : t.todo.selectedDays.replace('{n}', String(selectedDays.length))

  function toggleDay(day: string) {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day].sort()))
  }

  function runComplete(todo: Todo, completedOn?: string) {
    if (!completedOn && !canFillTodo(todo, todos)) return
    const day = todo.dueOn ?? completedOn ?? todayIso()
    setDrop({ day, kind: todo.subcategory, key: Date.now() })
    if (dropTimer.current) window.clearTimeout(dropTimer.current)
    dropTimer.current = window.setTimeout(() => {
      setDrop(undefined)
      if (completedOn) onPickFirstWater(todo, completedOn)
      else onComplete(todo)
      setPassport({ plantId: todo.plantId, careMark: todo.subcategory })
    }, 760)
  }

  return (
    <Root>
      <Board>
        <Filters>
          <FilterRow>
            <FilterLabel id="todo-plant-label">{t.todo.filterPlants}</FilterLabel>
            <FilterSelect
              aria-labelledby="todo-plant-label"
              value={plantFilter}
              onChange={(event) => {
                const value = event.target.value
                setPlantFilter(value === 'all' ? 'all' : value)
              }}
            >
              <option value="all">{t.todo.filterAllPlants}</option>
              {living.map((plant) => (
                <option key={plant.id} value={plant.id}>
                  {tr(plant.title, plant.titleHe)}
                </option>
              ))}
            </FilterSelect>
          </FilterRow>
          <FilterRow role="tablist" aria-label={t.todo.filterKinds}>
            <FilterLabel>{t.todo.filterKinds}</FilterLabel>
            <Chip type="button" $on={kindFilter === 'all'} onClick={() => setKindFilter('all')}>
              {t.todo.filterAllKinds}
            </Chip>
            {kinds.map((kind) => (
              <Chip
                key={kind}
                type="button"
                $on={kindFilter === kind}
                $tone={kind}
                onClick={() => setKindFilter(kind)}
              >
                <TodoKindIcon kind={kind} size={14} />
                {kindLabel(kind, t.todo)}
              </Chip>
            ))}
          </FilterRow>
        </Filters>

        <Head>
          <Nav type="button" onClick={() => onMonthChange(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1)}>
            ‹
          </Nav>
          <Month>{label}</Month>
          <Nav type="button" onClick={() => onMonthChange(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1)}>
            ›
          </Nav>
        </Head>
        <Week>
          {WEEKDAYS.map((day) => (
            <span key={day}>{t.todo.weekdays[day]}</span>
          ))}
        </Week>
        <Grid>
          {monthMatrix(year, month).map((day, index) => {
            if (day == null) return <Cell key={`e-${index}`} />
            const key = isoDay(year, month, day)
            const items = byDay.get(key) ?? []
            const tone = dayTone(items)
            const selected = selectedDays.includes(key)
            return (
              <Day
                key={key}
                $tone={tone}
                $selected={selected}
                aria-pressed={selected}
                onClick={() => toggleDay(key)}
              >
                <DayNum>{day}</DayNum>
                {items.length > 0 ? (
                  <Icons>
                    {items.slice(0, 3).map((todo) => {
                      const plant = plants.find((item) => item.id === todo.plantId)
                      return (
                        <PlantBtn
                          key={todo.id}
                          $tone={todo.subcategory === 'photo' ? 'photo' : 'water'}
                          aria-hidden
                        >
                          <PlantImage src={plant?.photos[0]} alt="" />
                          <PlantKind>
                            <TodoKindIcon kind={todo.subcategory} size={10} />
                          </PlantKind>
                        </PlantBtn>
                      )
                    })}
                  </Icons>
                ) : null}
                {drop?.day === key ? (
                  <DropIcon key={drop.key} $kind={drop.kind === 'photo' ? 'photo' : 'water'}>
                    <TodoKindIcon kind={drop.kind} size={28} mark />
                  </DropIcon>
                ) : null}
              </Day>
            )
          })}
        </Grid>
      </Board>

      <DayPanel>
        <DayPanelHead>
          <h3>{t.todo.dayTitle}</h3>
          <p>{selectedLabel}</p>
        </DayPanelHead>
        {selectedTodos.length === 0 ? (
          <EmptyDay>{t.todo.emptyDay}</EmptyDay>
        ) : (
          <DayList>
            {selectedTodos.map((todo) => {
              const plant = plants.find((item) => item.id === todo.plantId)
              if (!plant) return null
              return (
                <TodoCareCard
                  key={todo.id}
                  todo={todo}
                  plant={plant}
                  todos={todos}
                  onComplete={(row) => runComplete(row)}
                  onPickFirstWater={(row, picked) => runComplete(row, picked)}
                />
              )
            })}
          </DayList>
        )}
      </DayPanel>

      {passport ? (
        <PassportDialog
          plantId={passport.plantId}
          careMark={passport.careMark}
          tab="todo"
          onClose={() => setPassport(undefined)}
        />
      ) : null}
    </Root>
  )
}
