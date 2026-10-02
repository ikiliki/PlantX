import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { AddPlantCard } from '../../../greenhouse/components/AddPlantCard/AddPlantCard'
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
  Lift,
  Month,
  More,
  Nav,
  PlantBtn,
  PlantKind,
  Root,
  Stack,
  Week,
} from './TodoCalendar.styles'

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6]
const ALL_KINDS: TodoSubcategory[] = ['water', 'photo']
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

function DayMarks({ items, plants }: { items: Todo[]; plants: Plant[] }) {
  return (
    <>
      {items.map((todo) => {
        const plant = plants.find((item) => item.id === todo.plantId)
        return (
          <PlantBtn key={todo.id} $tone={todo.subcategory === 'photo' ? 'photo' : 'water'} aria-hidden>
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
  const [openDay, setOpenDay] = useState<string | null>(null)
  const dropTimer = useRef<number | undefined>(undefined)
  const focusedRef = useRef<string | undefined>(undefined)
  const holdTimer = useRef<number | undefined>(undefined)
  const holdOrigin = useRef<{ x: number; y: number } | null>(null)
  const holdCleanup = useRef<(() => void) | undefined>(undefined)
  const holdDay = useRef<string | null>(null)
  const heldOpen = useRef(false)
  const ignoreClickDay = useRef<string | null>(null)

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
        {firstPlant ? (
          <AddPlantCard hero onClick={() => onAddFirstPlant?.()} />
        ) : showFilters ? (
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
        ) : null}

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
                aria-label={
                  items.length > 0
                    ? t.todo.dayTasks.replace('{day}', String(day)).replace('{n}', String(items.length))
                    : undefined
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
                {items.length > 0 ? (
                  <Icons data-peek="">
                    <PlantBtn
                      $tone={items[0].subcategory === 'photo' ? 'photo' : 'water'}
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
