import { useState } from 'react'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { Plant, Todo } from '../../../../mock/types'
import { canFillTodo, isFirstWaterTodo, todayIso } from '../../todoSchedule'
import { TodoKindIcon } from '../TodoKindIcon/TodoKindIcon'
import { Action, Body, Card, DateField, Meta, Name, Photo, Tone } from './TodoCareCard.styles'

export function TodoCareCard({
  todo,
  plant,
  todos,
  onComplete,
  onPickFirstWater,
}: {
  todo: Todo
  plant: Plant
  todos: Todo[]
  onComplete: (todo: Todo) => void
  onPickFirstWater: (todo: Todo, day: string) => void
}) {
  const { t, tr } = useI18n()
  const first = isFirstWaterTodo(todo, todos)
  const fillable = canFillTodo(todo, todos)
  const [picking, setPicking] = useState(false)
  const photo = plant.photos[0]
  const tone = todo.subcategory === 'photo' ? 'photo' : 'water'
  const today = todayIso()
  const detail =
    todo.subcategory === 'photo'
      ? t.todo.detailPhoto
      : first
        ? t.todo.detailFirstWater
        : t.todo.detailWater

  return (
    <Card $tone={tone} aria-label={tr(plant.title, plant.titleHe)}>
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
        {first ? (
          picking ? (
            <DateField>
              <span>{t.todo.pickDay}</span>
              <input
                type="date"
                max={today}
                defaultValue={today}
                autoFocus
                onChange={(event) => {
                  const value = event.target.value
                  if (!value || value > today) return
                  onPickFirstWater(todo, value)
                }}
              />
            </DateField>
          ) : (
            <Action type="button" $tone={tone} onClick={() => setPicking(true)}>
              <TodoKindIcon kind="water" size={14} />
              {t.todo.actionSetWaterDate}
            </Action>
          )
        ) : fillable ? (
          <Action type="button" $tone={tone} onClick={() => onComplete(todo)}>
            <TodoKindIcon kind={todo.subcategory} size={14} />
            {todo.subcategory === 'photo' ? t.todo.actionPhoto : t.todo.actionWater}
          </Action>
        ) : (
          <Meta>{t.todo.notDueYet.replace('{day}', todo.dueOn ?? '—')}</Meta>
        )}
      </Body>
    </Card>
  )
}
