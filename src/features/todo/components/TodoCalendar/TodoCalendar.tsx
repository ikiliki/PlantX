import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Button } from '../../../../components/Button/Button'
import { FilterChips } from '../../../../components/FilterChips/FilterChips'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useMediaQuery } from '../../../../lib/useMediaQuery'
import { AddPlantCard } from '../../../greenhouse/components/AddPlantCard/AddPlantCard'
import { PassportDialog } from '../../../greenhouse/components/PassportDialog/PassportDialog'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { CareIcon, Plant, Todo, TodoSubcategory } from '../../../../mock/types'
import { canFillTodo, inCareFillWindow, isFirstWaterTodo, isOpenTodo, todayIso } from '../../todoSchedule'
import { careFillDays } from '../../carePlan'
import { useCareTasks } from '../../careKinds'
import { TodoCareCard } from '../TodoCareCard/TodoCareCard'
import { TodoDayPicker } from '../TodoDayPicker/TodoDayPicker'
import { TodoKindIcon } from '../TodoKindIcon/TodoKindIcon'
import {
  Board,
  Cell,
  Day,
  DayList,
  DayNum,
  DoneMark,
  Split,
  DayGroups,
  DayPanel,
  KindGroup,
  KindHead,
  DayPanelHead,
  HeadPicker,
  DropIcon,
  EmptyDay,
  FilterSelect,
  Grid,
  Head,
  Icons,
  Lift,
  Month,
  More,
  Nav,
  PlantBtn,
  PlantKind,
  Root,
  Stack,
  Toolbar,
  Week,
} from './TodoCalendar.styles'

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6]
const HOLD_OPEN_MS = 400

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

function dayTone(items: Todo[], iconOf: (kind: string) => CareIcon): CareIcon | 'mixed' | undefined {
  if (items.length === 0) return undefined
  const icons = new Set(items.map((todo) => iconOf(todo.subcategory)))
  return icons.size > 1 ? 'mixed' : iconOf(items[0].subcategory)
}

function DayMarks({ items, plants }: { items: Todo[]; plants: Plant[] }) {
  const care = useCareTasks()
  return (
    <>
      {items.map((todo) => {
        const plant = plants.find((item) => item.id === todo.plantId)
        return (
          <PlantBtn key={todo.id} $tone={care.icon(todo.subcategory)} aria-hidden>
            <PlantImage src={plant?.photos[0]} alt="" />
            <PlantKind>
              <TodoKindIcon kind={todo.subcategory} size={10} />
            </PlantKind>
          </PlantBtn>
        )
      })}
    </>
  )
}

export function TodoCalendar({
  year,
  month,
  todos,
  plants,
  focusTodoId,
  firstPlant = false,
  showFilters = true,
  onAddFirstPlant,
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
  /** Empty greenhouse: the undated first-plant task replaces the filters. */
  firstPlant?: boolean
  /** Hide filters while the plant list is still loading. */
  showFilters?: boolean
  onAddFirstPlant?: () => void
  onMonthChange: (year: number, month: number) => void
  onComplete: (todo: Todo) => void
  onPickFirstWater: (todo: Todo, day: string) => void
}) {
  const { t, tr, locale } = useI18n()
  const care = useCareTasks()
  const mobile = useMediaQuery('(max-width: 899px)')
  const open = todos.filter(isOpenTodo)
  const living = plants.filter((plant) => plant.status === 'owned' || plant.status === 'listed')
  const kinds = useMemo(() => {
    const present = new Set(open.map((todo) => todo.subcategory))
    return care.tasks.map((task) => task.id).filter((kind) => present.has(kind))
  }, [open, care.tasks])

  const [plantFilter, setPlantFilter] = useState<string | 'all'>('all')
  const [kindFilter, setKindFilter] = useState<TodoSubcategory | 'all'>('all')
  const [selectedDays, setSelectedDays] = useState<string[]>(() => [todayIso()])
  const [drop, setDrop] = useState<{ day: string; kind: TodoSubcategory; key: number } | undefined>()
  const [passport, setPassport] = useState<{ plantId: string; careMark: TodoSubcategory } | undefined>()
  const [fill, setFill] = useState<Todo | null>(null)
  const [fillYear, setFillYear] = useState(() => new Date().getUTCFullYear())
  const [fillMonth, setFillMonth] = useState(() => new Date().getUTCMonth())
  const [openDay, setOpenDay] = useState<string | null>(null)
  const dropTimer = useRef<number | undefined>(undefined)
  const focusedRef = useRef<string | undefined>(undefined)
  const holdTimer = useRef<number | undefined>(undefined)
  const holdOrigin = useRef<{ x: number; y: number } | null>(null)
  const holdCleanup = useRef<(() => void) | undefined>(undefined)
  const holdDay = useRef<string | null>(null)
  const heldOpen = useRef(false)
  const ignoreClickDay = useRef<string | null>(null)

  const today = todayIso()
  const scoped = useMemo(
    () =>
      open.filter((todo) => {
        if (plantFilter !== 'all' && todo.plantId !== plantFilter) return false
        if (kindFilter !== 'all' && todo.subcategory !== kindFilter) return false
        return true
      }),
    [open, plantFilter, kindFilter],
  )
  const filtered = scoped
  /** Care already done, on the day it was done, with the same plant and kind filters. */
  const doneByDay = new Map<string, Todo[]>()
  for (const todo of todos) {
    if (!todo.completedOn) continue
    if (plantFilter !== 'all' && todo.plantId !== plantFilter) continue
    if (kindFilter !== 'all' && todo.subcategory !== kindFilter) continue
    doneByDay.set(todo.completedOn, [...(doneByDay.get(todo.completedOn) ?? []), todo])
  }

  useEffect(() => {
    if (!focusTodoId || focusedRef.current === focusTodoId) return
    const todo = todos.find((row) => row.id === focusTodoId)
    if (!todo) return
    focusedRef.current = focusTodoId
    const day = todo.dueOn ?? todayIso()
    setPlantFilter(todo.plantId)
    setSelectedDays([day])
  }, [focusTodoId, todos])

  useEffect(() => {
    return () => {
      if (dropTimer.current) window.clearTimeout(dropTimer.current)
      if (holdTimer.current) window.clearTimeout(holdTimer.current)
      holdCleanup.current?.()
    }
  }, [])

  function clearHold() {
    if (holdTimer.current) window.clearTimeout(holdTimer.current)
    holdTimer.current = undefined
    holdOrigin.current = null
    holdCleanup.current?.()
    holdCleanup.current = undefined
  }

  function startHold(day: string, alreadyOpen: boolean, event: ReactPointerEvent) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    clearHold()
    holdDay.current = day
    holdOrigin.current = { x: event.clientX, y: event.clientY }
    const onMove = (move: PointerEvent) => {
      if (heldOpen.current) return
      const origin = holdOrigin.current
      if (!origin) return
      const dx = move.clientX - origin.x
      const dy = move.clientY - origin.y
      if (dx * dx + dy * dy > 64) cancelHold()
    }
    const onUp = () => endHold()
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    holdCleanup.current = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = undefined
      heldOpen.current = true
      if (!alreadyOpen) setOpenDay(day)
    }, HOLD_OPEN_MS)
  }

  function endHold() {
    const opened = heldOpen.current
    const day = holdDay.current
    heldOpen.current = false
    clearHold()
    if (opened && day) ignoreClickDay.current = day
  }

  function cancelHold() {
    heldOpen.current = false
    clearHold()
  }

  useEffect(() => {
    setOpenDay(null)
  }, [year, month, plantFilter, kindFilter])

  useEffect(() => {
    if (!openDay) return
    function close(event: PointerEvent) {
      const target = event.target
      if (target instanceof Element && target.closest('[data-open="true"]')) return
      setOpenDay(null)
    }
    window.addEventListener('pointerdown', close)
    return () => window.removeEventListener('pointerdown', close)
  }, [openDay])

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

  const shownTodos = selectedTodos
  function toggleDay(day: string) {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day].sort()))
  }

  function runComplete(todo: Todo, completedOn?: string) {
    if (completedOn) {
      if (!inCareFillWindow(completedOn, todo.subcategory) || !canFillTodo(todo, todos)) return
    } else if (!canFillTodo(todo, todos)) return

    const finish = () => {
      if (completedOn) onPickFirstWater(todo, completedOn)
      else onComplete(todo)
      // A fresh photo shows on the passport; other care just ticks off.
      if (todo.subcategory === 'photo') setPassport({ plantId: todo.plantId, careMark: todo.subcategory })
    }

    if (mobile) {
      finish()
      return
    }

    const day = todo.dueOn ?? completedOn ?? todayIso()
    setDrop({ day, kind: todo.subcategory, key: Date.now() })
    if (dropTimer.current) window.clearTimeout(dropTimer.current)
    dropTimer.current = window.setTimeout(() => {
      setDrop(undefined)
      finish()
    }, 760)
  }

  const kindOptions = [
    { id: 'all' as const, label: t.todo.filterAllKinds },
    ...kinds.map((kind) => ({ id: kind, label: care.name(kind), iconNode: <TodoKindIcon kind={kind} size={14} /> })),
  ]

  const plantSelect = (
    <FilterSelect
      aria-label={t.todo.filterPlants}
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
  )
  const kindChips = <FilterChips label={t.todo.filterKinds} options={kindOptions} value={kindFilter} onChange={setKindFilter} />
  const filtersOn = !firstPlant && showFilters

  // Wide: chips and the plant picker on one toolbar. Phone: the picker sits small beside the Tasks title and the
  // chips are one sideways row under it (same FilterChips as wide), never wrapping into a block.
  const toolbar = filtersOn ? (
    <Toolbar>
      {kindChips}
      {plantSelect}
    </Toolbar>
  ) : null

  const fullDate = (y: number, m: number, d: number) =>
    new Date(Date.UTC(y, m, d, 12)).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    })

  return (
    <Root>
      {mobile ? null : toolbar}
      {mobile && firstPlant ? <AddPlantCard hero onClick={() => onAddFirstPlant?.()} /> : null}
      {/* Wide: the day's tasks sit next to the calendar, so the first screen shows something to do. */}
      <Split>
      {mobile && firstPlant ? null : (
      <Board>
        {firstPlant && !mobile ? (
          <AddPlantCard hero onClick={() => onAddFirstPlant?.()} />
        ) : null}

        <Head>
          <Nav
            type="button"
            aria-label={t.todo.prevMonth}
            onClick={() => onMonthChange(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1)}
          >
            ‹
          </Nav>
          <Month>{label}</Month>
          <Nav
            type="button"
            aria-label={t.todo.nextMonth}
            onClick={() => onMonthChange(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1)}
          >
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
            const done = doneByDay.get(key) ?? []
            const tone = dayTone(items, care.icon)
            const selected = selectedDays.includes(key)
            const many = items.length > 1
            const expanded = openDay === key
            return (
              <Day
                key={key}
                $tone={tone}
                $selected={selected}
                role="button"
                tabIndex={0}
                aria-pressed={selected}
                aria-expanded={many ? expanded : undefined}
                // The full date, so screen readers and agents can tell the days apart (#44).
                aria-label={
                  items.length > 0
                    ? t.todo.dayTasksFull.replace('{date}', fullDate(year, month, day)).replace('{n}', String(items.length))
                    : fullDate(year, month, day)
                }
                data-open={expanded ? 'true' : undefined}
                onContextMenu={(event) => event.preventDefault()}
                onClick={() => {
                  if (ignoreClickDay.current) {
                    const skip = ignoreClickDay.current === key
                    ignoreClickDay.current = null
                    if (skip) return
                  }
                  if (expanded) {
                    setOpenDay(null)
                    return
                  }
                  toggleDay(key)
                }}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return
                  event.preventDefault()
                  if (expanded) {
                    setOpenDay(null)
                    return
                  }
                  toggleDay(key)
                }}
                onPointerDown={(event) => {
                  if (!many) return
                  startHold(key, expanded, event)
                }}
              >
                <DayNum>{day}</DayNum>
                {done.length > 0 ? (
                  <DoneMark
                    $kind={care.icon(done[0].subcategory)}
                    title={t.todo.doneOnDay.replace('{n}', String(done.length))}
                  >
                    ✓
                  </DoneMark>
                ) : null}
                {items.length > 0 ? (
                  <Icons data-peek="">
                    <PlantBtn
                      $tone={care.icon(items[0].subcategory)}
                      $stacked={many}
                      aria-hidden
                    >
                      <PlantImage src={plants.find((item) => item.id === items[0].plantId)?.photos[0]} alt="" />
                      <PlantKind>
                        <TodoKindIcon kind={items[0].subcategory} size={10} />
                      </PlantKind>
                      {many ? <More>+{items.length - 1}</More> : null}
                    </PlantBtn>
                  </Icons>
                ) : null}
                {many ? (
                  <Lift data-lift="" $tone={tone} $selected={selected}>
                    <DayNum>{day}</DayNum>
                    <Stack>
                      <DayMarks items={items} plants={plants} />
                    </Stack>
                  </Lift>
                ) : null}
                {drop?.day === key ? (
                  <DropIcon key={drop.key} $kind={care.icon(drop.kind)}>
                    <TodoKindIcon kind={drop.kind} size={28} mark />
                  </DropIcon>
                ) : null}
              </Day>
            )
          })}
        </Grid>
      </Board>
      )}

      {mobile && firstPlant ? null : (
      <DayPanel>
        <DayPanelHead>
          <h3>{mobile ? t.todo.title : t.todo.dayTitle}</h3>
          {mobile ? (filtersOn ? <HeadPicker>{plantSelect}</HeadPicker> : null) : <p>{selectedLabel}</p>}
        </DayPanelHead>
        {mobile && filtersOn ? kindChips : null}
        {shownTodos.length === 0 ? (
          <EmptyDay>{mobile ? t.todo.emptyTasks : t.todo.emptyDay}</EmptyDay>
        ) : (
          <DayGroups>
            {care.tasks.map(({ id: kind }) => {
              const group = shownTodos.filter((todo) => todo.subcategory === kind)
              if (group.length === 0) return null
              // Done all: every task of this kind that can be ticked off now (a first watering still needs its day).
              const ready = group.filter((todo) => canFillTodo(todo, todos) && !isFirstWaterTodo(todo, todos))
              return (
                <KindGroup key={kind} data-care-group={kind}>
                  <KindHead>
                    <TodoKindIcon kind={kind} size={16} />
                    {care.name(kind)}
                    <span>({group.length})</span>
                    {ready.length > 1 ? (
                      <Button size="sm" variant="ghost" type="button" onClick={() => ready.forEach((todo) => onComplete(todo))}>
                        {t.todo.doneAll.replace('{n}', String(ready.length))}
                      </Button>
                    ) : null}
                  </KindHead>
                    <DayList>
                      {group.map((todo) => {
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
                            onOpen={
                              mobile
                                ? () => {
                                    const date = new Date(`${today}T12:00:00.000Z`)
                                    setFillYear(date.getUTCFullYear())
                                    setFillMonth(date.getUTCMonth())
                                    setFill(todo)
                                  }
                                : undefined
                            }
                          />
                        )
                      })}
                    </DayList>
                </KindGroup>
              )
            })}
          </DayGroups>
        )}
      </DayPanel>
      )}
      </Split>

      {fill ? (
        <TodoDayPicker
          year={fillYear}
          month={fillMonth}
          today={today}
          selected={canFillTodo(fill, todos) && inCareFillWindow(today, fill.subcategory, today) ? [today] : []}
          marks={new Set()}
          single
          note={
            canFillTodo(fill, todos)
              ? fill.subcategory === 'photo'
                ? t.todo.fillWindowPhoto
                : fill.subcategory === 'water'
                  ? t.todo.fillWindowWater
                  : t.todo.fillWindowOther.replace('{n}', String(careFillDays(fill.subcategory)))
              : t.todo.fillNotDue.replace('{day}', fill.dueOn ?? '—')
          }
          allow={(day) => canFillTodo(fill, todos) && inCareFillWindow(day, fill.subcategory, today)}
          onMonthChange={(nextYear, nextMonth) => {
            setFillYear(nextYear)
            setFillMonth(nextMonth)
          }}
          onOk={(days) => {
            const day = days[0]
            const todo = fill
            setFill(null)
            if (!day || !todo) return
            runComplete(todo, day)
          }}
          onClose={() => setFill(null)}
        />
      ) : null}

      {passport ? (
        <PassportDialog
          plantId={passport.plantId}
          careMark={passport.careMark}
          tab="care"
          onClose={() => setPassport(undefined)}
        />
      ) : null}
    </Root>
  )
}
