import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { Icon } from '../../../../components/Icon/Icon'
import type { CareRule, Plant, PlantCare, Todo, TodoSubcategory } from '../../../../mock/types'
import { EditPencil, InlineEdit } from '../../../greenhouse/components/InlineEdit/InlineEdit'
import { CARE_INTERVAL_CHOICES, careFor, careResting, type EffectiveCare } from '../../carePlan'
import { useCareTasks } from '../../careKinds'
import { isFirstWaterTodo, isOpenTodo, todayIso } from '../../todoSchedule'
import { TodoKindIcon } from '../TodoKindIcon/TodoKindIcon'
import {
  AddChip,
  AddRow,
  Block,
  Copy,
  DoneRow,
  Due,
  Empty,
  Kind,
  List,
  PlanRow,
  PrivateNote,
  Root,
} from './PassportTodo.styles'

function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000)
}

/**
 * The passport Tasks tab (the grower's own): the care plan, one row per task with how often, last done and
 * next due. The pencil offers the catalog's suggestion first (marked default; AI's when AI suggested it), other
 * intervals, and pause; a task with no interval anywhere says so and gets a "Set schedule" task. Optional tasks
 * can be added. Then the care history.
 */
export function PassportTodo({
  plant,
  todos,
  careMark,
}: {
  plant: Plant
  todos: Todo[]
  careMark?: TodoSubcategory
}) {
  const { t, locale } = useI18n()
  const { db, editPlant } = useStore()
  const care = useCareTasks()
  const [editing, setEditing] = useState<string | null>(null)
  const today = todayIso()
  const plantTodos = todos.filter((todo) => todo.plantId === plant.id && todo.category === 'plant')
  const plan = careFor(plant, db.catalog)

  const dateFormat = new Intl.DateTimeFormat(locale === 'he' ? 'he-IL' : 'en-GB', { day: 'numeric', month: 'short' })
  const monthFormat = new Intl.DateTimeFormat(locale === 'he' ? 'he-IL' : 'en-GB', { month: 'short' })
  const shortDate = (iso: string) => dateFormat.format(new Date(`${iso}T12:00:00Z`))
  const monthName = (month: number) => monthFormat.format(new Date(Date.UTC(2026, month - 1, 15)))

  const every = (rule: CareRule) => {
    const base = rule.winterEveryDays
      ? t.passport.careEveryWinter.replace('{n}', String(rule.everyDays)).replace('{w}', String(rule.winterEveryDays))
      : t.passport.careEvery.replace('{n}', String(rule.everyDays))
    const months = rule.months
    return months && months.length > 0 ? `${base} · ${monthName(months[0])}–${monthName(months[months.length - 1])}` : base
  }
  const cadence = (rule: CareRule) => {
    if (!careResting(rule, today)) return every(rule)
    const months = rule.months ?? []
    const next = months.find((month) => month > Number(today.slice(5, 7))) ?? months[0]
    return `${t.passport.careEvery.replace('{n}', String(rule.everyDays))} · ${t.passport.careResting.replace('{month}', monthName(next))}`
  }
  const suggestionLabel = (item: EffectiveCare) =>
    item.suggested
      ? `${(item.suggestedFrom?.ai ? t.passport.careSuggestedAi : t.passport.careSuggested).replace('{rule}', every(item.suggested))} ${t.passport.careDefaultTag}`
      : ''

  const lastDone = (kind: string) =>
    plantTodos
      .filter((todo) => todo.subcategory === kind && todo.completedOn != null)
      .map((todo) => todo.completedOn as string)
      .sort()
      .pop()

  const saveCare = async (next: PlantCare) => editPlant(plant.id, { care: next })

  const save = async (item: EffectiveCare, choice: string) => {
    const next: PlantCare = { ...(plant.care ?? {}) }
    const id = item.task.id
    const added = Boolean(next[id]?.added)
    if (choice === 'suggested') {
      if (added) next[id] = { added: true }
      else delete next[id]
    } else if (choice === 'off') next[id] = { off: true }
    else if (choice === 'remove') delete next[id]
    else {
      const months = item.suggested?.months
      next[id] = { ...(added ? { added: true } : {}), interval: { everyDays: Number(choice), ...(months ? { months } : {}) } }
    }
    const ok = await saveCare(next)
    if (ok) setEditing(null)
    return ok
  }

  const history = plantTodos
    .filter((todo) => todo.completedOn != null)
    .sort((a, b) => (b.completedOn ?? '').localeCompare(a.completedOn ?? ''))

  const shown = plan.filter((item) => item.active || item.own)
  const offered = plan.filter((item) => item.offered)

  return (
    <Root>
      {/* Tasks are the grower's own; the story is what others see. */}
      <PrivateNote data-tasks-private>
        <Icon name="lock" size={14} />
        <span>{t.passport.careOnlyYou}</span>
      </PrivateNote>
      <Block>
        <h3>{t.passport.carePlan}</h3>
        <List>
          {shown.map((item) => {
            const kind = item.task.id
            const name = care.name(kind)
            const paused = !item.active
            const open = plantTodos.find((todo) => todo.subcategory === kind && isOpenTodo(todo))
            const last = lastDone(kind)
            const late = open?.dueOn ? daysBetween(open.dueOn, today) : 0
            const firstWater = open ? isFirstWaterTodo(open, plantTodos) : false
            const needsSchedule = !paused && !item.interval
            const due = paused
              ? null
              : needsSchedule
                ? t.todo.actionSetSchedule
                : !open
                  ? null
                  : firstWater
                    ? t.passport.todoFirstWater
                    : late > 0
                      ? t.todo.statusOverdue.replace('{n}', String(late))
                      : late === 0
                        ? t.todo.statusToday
                        : t.passport.careNext.replace('{day}', shortDate(open.dueOn as string))
            const own = plant.care?.[kind]
            const current = own?.off ? 'off' : own?.interval ? String(own.interval.everyDays) : 'suggested'
            const options = [
              ...(item.suggested ? [{ id: 'suggested', label: suggestionLabel(item) }] : []),
              // Intervals near the suggestion only (a third to three times it): no "every 730 days" for watering.
              ...CARE_INTERVAL_CHOICES.filter((days) => {
                const base = item.suggested?.everyDays ?? 14
                return days >= base / 3 && days <= base * 3 && (days !== item.suggested?.everyDays || item.suggested.months)
              }).map(
                (days) => ({ id: String(days), label: t.passport.careEvery.replace('{n}', String(days)) }),
              ),
            ]
            // Pause and Remove act at once: they sit in the footer next to Cancel and Save, not among the intervals.
            const actions = [
              ...(own?.off ? [] : [{ id: 'off', label: t.passport.carePause }]),
              ...(own?.added ? [{ id: 'remove', label: t.passport.careRemove, variant: 'danger' as const }] : []),
            ]
            return (
              <PlanRow key={kind} $tone={item.task.icon} $off={paused} $mark={careMark === kind} data-care-kind={kind}>
                <Kind>
                  <TodoKindIcon kind={kind} size={18} />
                </Kind>
                <Copy>
                  <strong>{name}</strong>
                  <span>
                    {paused
                      ? t.passport.carePaused
                      : item.interval
                        ? `${cadence(item.interval)} · ${last ? t.passport.careLast.replace('{day}', shortDate(last)) : t.passport.careNever}`
                        : t.passport.careNoSchedule}
                  </span>
                </Copy>
                {due ? (
                  needsSchedule ? (
                    <Due as="button" type="button" $tone={item.task.icon} $late onClick={() => setEditing(kind)}>
                      {due}
                    </Due>
                  ) : (
                    <Due as={Link} to={open ? `/tasks/${open.id}` : '/tasks'} $tone={item.task.icon} $late={late > 0}>
                      {due}
                    </Due>
                  )
                ) : (
                  <span />
                )}
                <EditPencil label={name} onClick={() => setEditing(kind)} />
                {editing === kind ? (
                  <InlineEdit
                    label={name}
                    kind="choice"
                    value={current}
                    options={options}
                    actions={actions}
                    onSave={(choice) => save(item, choice)}
                    onCancel={() => setEditing(null)}
                  />
                ) : null}
              </PlanRow>
            )
          })}
        </List>
        {offered.length > 0 ? (
          <AddRow>
            <span>{t.passport.careAdd}</span>
            {offered.map((item) => (
              <AddChip
                key={item.task.id}
                type="button"
                data-care-add={item.task.id}
                onClick={() => void saveCare({ ...(plant.care ?? {}), [item.task.id]: { added: true } })}
              >
                <TodoKindIcon kind={item.task.id} size={14} />+ {care.name(item.task.id)}
              </AddChip>
            ))}
          </AddRow>
        ) : null}
      </Block>

      <Block>
        <h3>{t.passport.careHistory}</h3>
        {history.length === 0 ? (
          <Empty>{t.passport.todoEmptyHistory}</Empty>
        ) : (
          <List>
            {history.map((todo) => (
              <DoneRow
                key={todo.id}
                $tone={care.icon(todo.subcategory)}
                $mark={careMark === todo.subcategory && todo === history[0]}
              >
                <Kind>
                  <TodoKindIcon kind={todo.subcategory} size={18} />
                </Kind>
                <Copy>
                  <strong>{care.name(todo.subcategory)}</strong>
                  <span>{t.passport.todoDone.replace('{day}', shortDate(todo.completedOn as string))}</span>
                </Copy>
              </DoneRow>
            ))}
          </List>
        )}
      </Block>
    </Root>
  )
}
