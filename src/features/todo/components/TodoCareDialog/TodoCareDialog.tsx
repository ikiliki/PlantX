import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { Plant, Todo, TodoSubcategory } from '../../../../mock/types'
import { PassportDialog } from '../../../greenhouse/components/PassportDialog/PassportDialog'
import { todayIso } from '../../todoSchedule'
import { TodoCareCard } from '../TodoCareCard/TodoCareCard'
import { Backdrop, Body, Close, DayHead, Dialog, Title } from './TodoCareDialog.styles'

export function TodoCareDialog({
  todo,
  plant,
  todos,
  onClose,
  onComplete,
  onPickFirstWater,
}: {
  todo: Todo
  plant: Plant
  todos: Todo[]
  onClose: () => void
  onComplete: (todo: Todo) => void
  onPickFirstWater: (todo: Todo, day: string) => void
}) {
  const { t, locale } = useI18n()
  const [passport, setPassport] = useState<{ plantId: string; careMark: TodoSubcategory } | undefined>()
  const day = todo.dueOn ?? todayIso()
  const dayLabel = new Date(`${day}T12:00:00.000Z`).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const finish = (careMark: TodoSubcategory) => {
    setPassport({ plantId: plant.id, careMark })
  }

  return createPortal(
    <>
      {!passport ? (
        <Backdrop onClick={onClose}>
          <Dialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="todo-care-title"
            onClick={(event) => event.stopPropagation()}
          >
            <Close type="button" onClick={onClose} aria-label={t.common.cancel}>
              ×
            </Close>
            <DayHead>{t.todo.careDay}</DayHead>
            <Title id="todo-care-title">{dayLabel}</Title>
            <Body>
              <TodoCareCard
                todo={todo}
                plant={plant}
                todos={todos}
                onComplete={(row) => {
                  onComplete(row)
                  finish(row.subcategory)
                }}
                onPickFirstWater={(row, picked) => {
                  onPickFirstWater(row, picked)
                  finish(row.subcategory)
                }}
              />
            </Body>
          </Dialog>
        </Backdrop>
      ) : null}
      {passport ? (
        <PassportDialog
          plantId={passport.plantId}
          careMark={passport.careMark}
          onClose={() => {
            setPassport(undefined)
            onClose()
          }}
        />
      ) : null}
    </>,
    document.body,
  )
}
