import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { Plant, Todo } from '../../../../mock/types'
import { canFillTodo, careFillWindow, isFirstWaterTodo, isSetTodo, todayIso } from '../../todoSchedule'
import { useCareTasks } from '../../careKinds'
import { TodoKindIcon } from '../TodoKindIcon/TodoKindIcon'
import { Action, Body, Card, CardHit, DateActions, DateField, DateForm, Meta, Name, Photo, Tone } from './TodoCareCard.styles'

export function TodoCareCard({
  todo,
  plant,
  todos,
  onComplete,
  onPickFirstWater,
  onOpen,
}: {
  todo: Todo
  plant: Plant
  todos: Todo[]
  onComplete: (todo: Todo) => void
  onPickFirstWater: (todo: Todo, day: string) => void
  /** Phone: the card opens the day sheet instead of completing in place. */
  onOpen?: () => void
}) {
  const { t, tr } = useI18n()
  const care = useCareTasks()
  const first = isFirstWaterTodo(todo, todos)
  const fillable = canFillTodo(todo, todos)
  const [picking, setPicking] = useState(false)
  const [picked, setPicked] = useState(() => todayIso())
  const photo = plant.photos[0]
  const tone = care.icon(todo.subcategory)
  const today = todayIso()
  const fillWindow = careFillWindow(todo.subcategory, today)
  const pickedOk = Boolean(picked) && picked <= today && picked >= fillWindow.min
  const set = isSetTodo(todo, todos)
  const detail = first ? t.todo.detailFirstWater : set ? t.todo.detailSetSchedule : care.detail(todo.subcategory)
  const actionLabel = first ? t.todo.actionSetWaterDate : set ? t.todo.actionSetSchedule : care.name(todo.subcategory)

  const body = (
    <>
      <Photo>
        <PlantImage src={photo} alt="" />
        <Tone $tone={tone}>
          <TodoKindIcon kind={todo.subcategory} size={12} />
          {care.name(todo.subcategory)}
        </Tone>
      </Photo>
      <Body>
        <Name>{tr(plant.title, plant.titleHe)}</Name>
        <Meta>{detail}</Meta>
        {set ? (
          <Action as="span" $tone={tone}>
            <TodoKindIcon kind={todo.subcategory} size={14} />
            {actionLabel}
          </Action>
        ) : onOpen && (first || fillable) ? (
          <Action as="span" $tone={tone}>
            <TodoKindIcon kind={todo.subcategory} size={14} />
            {actionLabel}
          </Action>
        ) : first ? (
          picking ? (
            // Pick a day, then Save: a change alone never completes the task, and today can be saved as is.
            <DateForm
              onSubmit={(event) => {
                event.preventDefault()
                if (pickedOk) onPickFirstWater(todo, picked)
              }}
            >
              <DateField>
                <span>{t.todo.pickDay}</span>
                <input
                  type="date"
                  min={fillWindow.min}
                  max={today}
                  value={picked}
                  autoFocus
                  onChange={(event) => setPicked(event.target.value)}
                />
              </DateField>
              <DateActions>
                <Action type="button" $tone="quiet" onClick={() => setPicking(false)}>
                  {t.todo.cancel}
                </Action>
                <Action type="submit" $tone={tone} disabled={!pickedOk}>
                  {t.todo.saveWaterDate}
                </Action>
              </DateActions>
            </DateForm>
          ) : (
            <Action type="button" $tone={tone} onClick={() => setPicking(true)}>
              <TodoKindIcon kind="water" size={14} />
              {t.todo.actionSetWaterDate}
            </Action>
          )
        ) : fillable ? (
          <Action type="button" $tone={tone} onClick={() => onComplete(todo)}>
            <TodoKindIcon kind={todo.subcategory} size={14} />
            {actionLabel}
          </Action>
        ) : (
          <Meta>{t.todo.notDueYet.replace('{day}', todo.dueOn ?? '—')}</Meta>
        )}
      </Body>
    </>
  )

  // Nothing to tick yet: the whole card opens the passport's Tasks tab, where the owner sets how often.
  if (set) {
    return (
      <CardHit as={Link} to={`/plants/${plant.id}?tab=care`} $tone={tone} aria-label={tr(plant.title, plant.titleHe)}>
        {body}
      </CardHit>
    )
  }

  if (onOpen) {
    return (
      <CardHit $tone={tone} type="button" aria-label={tr(plant.title, plant.titleHe)} onClick={onOpen}>
        {body}
      </CardHit>
    )
  }

  return (
    <Card $tone={tone} aria-label={tr(plant.title, plant.titleHe)}>
      {body}
    </Card>
  )
}
