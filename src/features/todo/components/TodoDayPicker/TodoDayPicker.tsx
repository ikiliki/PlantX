import { useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../../../../components/Button/Button'
import { SheetGrip, useSheetDrag } from '../../../../components/SheetGrip/SheetGrip'
import { useI18n } from '../../../../i18n/I18nProvider'
import { Backdrop, Blank, Day, Grid, Head, Month, Nav, Note, Sheet, Week } from './TodoDayPicker.styles'

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6]

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

/**
 * Phone day picker: a short bottom sheet. Days stay a draft until OK, which fills the selection.
 */
export function TodoDayPicker({
  year,
  month,
  today,
  selected,
  marks,
  allow,
  single = false,
  note,
  onMonthChange,
  onOk,
  onClose,
}: {
  year: number
  month: number
  today: string
  selected: string[]
  /** Days that already have a task, shown as a dot. */
  marks: ReadonlySet<string>
  /** When set, only these days can be chosen. Others stay visible and locked. */
  allow?: (day: string) => boolean
  /** One day, for logging care. The Days filter stays multi-select. */
  single?: boolean
  /** Short reason the other days are locked. */
  note?: string
  onMonthChange: (year: number, month: number) => void
  onOk: (days: string[]) => void
  onClose: () => void
}) {
  const { t, locale } = useI18n()
  const [draft, setDraft] = useState<string[]>(selected)
  const sheet = useSheetDrag(onClose)
  const label = new Date(Date.UTC(year, month, 1)).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

  useLayoutEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function allowed(day: string) {
    return allow ? allow(day) : true
  }

  function toggle(day: string) {
    if (!allowed(day)) return
    setDraft((prev) => {
      if (single) return prev.length === 1 && prev[0] === day ? [] : [day]
      return prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day].sort()
    })
  }

  return createPortal(
    <Backdrop onClick={onClose}>
      <Sheet
        ref={sheet.bind}
        role="dialog"
        aria-modal="true"
        aria-label={t.todo.calendarChip}
        onClick={(event) => event.stopPropagation()}
      >
        <SheetGrip label={t.common.dragToClose} shown {...sheet.grip} />
        <Head>
          <Nav type="button" onClick={() => onMonthChange(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1)}>
            ‹
          </Nav>
          <Month>{label}</Month>
          <Nav type="button" onClick={() => onMonthChange(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1)}>
            ›
          </Nav>
        </Head>
        {note ? <Note>{note}</Note> : null}
        <Week>
          {WEEKDAYS.map((day) => (
            <span key={day}>{t.todo.weekdays[day]}</span>
          ))}
        </Week>
        <Grid>
          {monthMatrix(year, month).map((day, index) => {
            if (day == null) return <Blank key={`e-${index}`} />
            const key = isoDay(year, month, day)
            const on = draft.includes(key)
            const locked = !allowed(key)
            return (
              <Day
                key={key}
                type="button"
                $on={on}
                $today={key === today}
                $mark={marks.has(key)}
                $locked={locked}
                disabled={locked}
                aria-pressed={on}
                onClick={() => toggle(key)}
              >
                {day}
              </Day>
            )
          })}
        </Grid>
        <Button type="button" block disabled={single && draft.length !== 1} onClick={() => onOk(draft)}>
          {t.todo.daysOk}
        </Button>
      </Sheet>
    </Backdrop>,
    document.body,
  )
}
