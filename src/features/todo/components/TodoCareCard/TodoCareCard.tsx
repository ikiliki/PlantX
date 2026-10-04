import { useState } from 'react'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { Plant, Todo } from '../../../../mock/types'
import { canFillTodo, careFillWindow, isFirstWaterTodo, todayIso } from '../../todoSchedule'
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
  const first = isFirstWaterTodo(todo, todos)
  const fillable = canFillTodo(todo, todos)
  const [picking, setPicking] = useState(false)
  const [picked, setPicked] = useState(() => todayIso())
  const photo = plant.photos[0]
  const tone = todo.subcategory === 'photo' ? 'photo' : 'water'
  const today = todayIso()
  const fillWindow = careFillWindow(todo.subcategory, today)
  const pickedOk = Boolean(picked) && picked <= today && picked >= fillWindow.min
  const detail =
    todo.subcategory === 'photo'
      ? t.todo.detailPhoto
      : first
        ? t.todo.detailFirstWater
        : t.todo.detailWater

  const actionLabel = first
    ? t.todo.actionSetWaterDate
    : todo.subcategory === 'photo'
      ? t.todo.actionPhoto
      : t.todo.actionWater

  const body = (
    <>
      <Photo>
        <PlantImage src={photo} alt="" />
        <Tone $tone={tone}>
          <TodoKindIcon kind={todo.subcategory} size={12} />
          {todo.subcategory === 'photo' ? t.todo.actionPhoto : t.todo.actionWater}
        </Tone>
      </Photo>
      <Body>
        <Name>{tr(plant.title, plant.titleHe)}</Name>
        <Meta>{detail}</Meta>
        {onOpen && (first || fillable) ? (
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
