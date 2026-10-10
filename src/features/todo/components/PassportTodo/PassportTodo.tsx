import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { CarePlan, CareRule, Plant, Todo, TodoSubcategory } from '../../../../mock/types'
import { EditPencil, InlineEdit } from '../../../greenhouse/components/InlineEdit/InlineEdit'
import { CARE_INTERVAL_CHOICES, careFor, careResting } from '../../carePlan'
import { careKindName } from '../../careKinds'
import { addDays, isFirstWaterTodo, isOpenTodo, todayIso } from '../../todoSchedule'
import { TodoKindIcon } from '../TodoKindIcon/TodoKindIcon'
import {
  Block,
  BlockHead,
  Copy,
  DoneRow,
  Due,
  Empty,
  HeadNote,
  Kind,
  List,
  PlanRow,
  Root,
  Week,
  Weeks,
} from './PassportTodo.styles'

const WEEKS = 12

function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000)
}

/**
 * The passport Tasks tab: the plant's care plan (one row per kind: how often, last done, next due), the
 * last twelve weeks of care, and the care history. The owner changes a kind's interval, pauses it, or goes
 * back to the catalog's rule with the pencil; another grower sees the plan read-only.
 */
export function PassportTodo({
  plant,
  todos,
  careMark,
  readOnly = false,
}: {
  plant: Plant
  todos: Todo[]
  careMark?: TodoSubcategory
  /** Another grower's plant: the plan shows, but nothing opens the Tasks page or changes it. */
  readOnly?: boolean
}) {
  const { t, locale } = useI18n()
  const { db, editPlant } = useStore()
  const [editing, setEditing] = useState<TodoSubcategory | null>(null)
  const today = todayIso()
  const plantTodos = todos.filter((todo) => todo.plantId === plant.id && todo.category === 'plant')
  const plan = careFor(plant, db.catalog)
  const catalogPlan = careFor({ ...plant, care: undefined }, db.catalog)
  const ownPlan = Boolean(plant.care && Object.keys(plant.care).length > 0)

  const dateFormat = new Intl.DateTimeFormat(locale === 'he' ? 'he-IL' : 'en-GB', { day: 'numeric', month: 'short' })
  const monthFormat = new Intl.DateTimeFormat(locale === 'he' ? 'he-IL' : 'en-GB', { month: 'short' })
  const shortDate = (iso: string) => dateFormat.format(new Date(`${iso}T12:00:00Z`))
  const monthName = (month: number) => monthFormat.format(new Date(Date.UTC(2026, month - 1, 15)))

  const cadence = (rule: CareRule) => {
    const every = rule.winterEveryDays
      ? t.passport.careEveryWinter.replace('{n}', String(rule.everyDays)).replace('{w}', String(rule.winterEveryDays))
      : t.passport.careEvery.replace('{n}', String(rule.everyDays))
    const months = rule.months
    if (!months || months.length === 0) return every
    const season = `${monthName(months[0])}–${monthName(months[months.length - 1])}`
    if (!careResting(rule, today)) return `${every} · ${season}`
    const next = months.find((month) => month > Number(today.slice(5, 7))) ?? months[0]
    return `${every} · ${t.passport.careResting.replace('{month}', monthName(next))}`
  }

  const lastDone = (kind: TodoSubcategory) =>
    plantTodos
      .filter((todo) => todo.subcategory === kind && todo.completedOn != null)
      .map((todo) => todo.completedOn as string)
      .sort()
      .pop()

  const save = async (kind: TodoSubcategory, choice: string) => {
    const next: CarePlan = { ...(plant.care ?? {}) }
    if (choice === 'catalog') delete next[kind]
    else if (choice === 'off') next[kind] = null
    else {
      const months = catalogPlan.find((item) => item.kind === kind)?.rule?.months
      next[kind] = { everyDays: Number(choice), ...(months ? { months } : {}) }
    }
    const ok = await editPlant(plant.id, { care: next })
    if (ok) setEditing(null)
    return ok
  }

  // Twelve weeks back from today: which kind was done in each, and how much was on time.
  const since = addDays(today, -WEEKS * 7 + 1)
  const recent = plantTodos.filter((todo) => todo.completedOn != null && todo.completedOn >= since)
  const weeks: (TodoSubcategory | undefined)[] = Array.from({ length: WEEKS }, () => undefined)
  for (const todo of recent) {
    const cell = WEEKS - 1 - Math.floor(daysBetween(todo.completedOn as string, today) / 7)
    if (cell >= 0 && cell < WEEKS) weeks[cell] ??= todo.subcategory
  }
  const onTime = recent.filter((todo) => todo.dueOn == null || daysBetween(todo.dueOn, todo.completedOn as string) <= 1)

  const history = plantTodos
    .filter((todo) => todo.completedOn != null)
    .sort((a, b) => (b.completedOn ?? '').localeCompare(a.completedOn ?? ''))

  return (
    <Root>
      <Block>
        <BlockHead>
          <h3>{t.passport.carePlan}</h3>
          <HeadNote>{ownPlan ? t.passport.careYours : t.passport.careFromCatalog}</HeadNote>
        </BlockHead>
        <List>
          {plan.map(({ kind, rule }) => {
            if (!rule && readOnly) return null
            const name = careKindName(kind, t)
            const open = plantTodos.find((todo) => todo.subcategory === kind && isOpenTodo(todo))
            const last = lastDone(kind)
            const late = open?.dueOn ? daysBetween(open.dueOn, today) : 0
            const due = !open
              ? null
              : isFirstWaterTodo(open, plantTodos)
                ? t.passport.todoFirstWater
                : late > 0
                  ? t.todo.statusOverdue.replace('{n}', String(late))
                  : late === 0
                    ? t.todo.statusToday
                    : t.passport.careNext.replace('{day}', shortDate(open.dueOn as string))
            const own = plant.care && kind in plant.care ? plant.care[kind] : undefined
            const current = own === undefined ? 'catalog' : own === null ? 'off' : String(own.everyDays)
            const catalogRule = catalogPlan.find((item) => item.kind === kind)?.rule
            return (
              <PlanRow key={kind} $tone={kind} $off={!rule} $mark={careMark === kind} data-care-kind={kind}>
                <Kind>
                  <TodoKindIcon kind={kind} size={18} />
                </Kind>
                <Copy>
                  <strong>{name}</strong>
                  <span>
                    {rule ? cadence(rule) : t.passport.careOff}
                    {rule ? ` · ${last ? t.passport.careLast.replace('{day}', shortDate(last)) : t.passport.careNever}` : ''}
                  </span>
                </Copy>
                {due && open ? (
                  readOnly ? (
                    <Due $tone={kind} $late={late > 0}>
                      {due}
                    </Due>
                  ) : (
                    <Due as={Link} to={`/tasks/${open.id}`} $tone={kind} $late={late > 0}>
                      {due}
                    </Due>
                  )
                ) : (
                  <span />
                )}
                {readOnly ? null : (
                  <EditPencil label={name} onClick={() => setEditing(kind)} />
                )}
                {editing === kind ? (
                  <InlineEdit
                    label={name}
                    kind="choice"
                    value={current}
                    options={[
                      {
                        id: 'catalog',
                        label: catalogRule ? `${t.passport.careUseCatalog} · ${cadence(catalogRule)}` : `${t.passport.careUseCatalog} · ${t.passport.careOff}`,
                      },
                      ...CARE_INTERVAL_CHOICES[kind].map((days) => ({
                        id: String(days),
                        label: t.passport.careEvery.replace('{n}', String(days)),
                      })),
                      { id: 'off', label: t.passport.carePause },
                    ]}
                    onSave={(choice) => save(kind, choice)}
                    onCancel={() => setEditing(null)}
                  />
                ) : null}
              </PlanRow>
            )
          })}
        </List>
      </Block>

      <Block>
        <BlockHead>
          <h3>{t.passport.careWeeks}</h3>
          {recent.length > 0 ? (
            <HeadNote>
              {t.passport.careOnTime.replace('{n}', String(onTime.length)).replace('{total}', String(recent.length))}
            </HeadNote>
          ) : null}
        </BlockHead>
        <Weeks aria-hidden data-care-weeks>
          {weeks.map((kind, index) => (
            <Week key={index} $tone={kind} />
          ))}
        </Weeks>
      </Block>

      <Block>
        <h3>{t.passport.careHistory}</h3>
        {history.length === 0 ? (
          <Empty>{t.passport.todoEmptyHistory}</Empty>
        ) : (
          <List>
            {history.map((todo) => (
              <DoneRow key={todo.id} $tone={todo.subcategory} $mark={careMark === todo.subcategory && todo === history[0]}>
                <Kind>
                  <TodoKindIcon kind={todo.subcategory} size={18} />
                </Kind>
                <Copy>
                  <strong>{careKindName(todo.subcategory, t)}</strong>
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
