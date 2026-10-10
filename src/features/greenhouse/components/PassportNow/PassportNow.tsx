import { Link } from 'react-router-dom'
import { useI18n } from '../../../../i18n/I18nProvider'
import { TodoKindIcon } from '../../../todo/components/TodoKindIcon/TodoKindIcon'
import { todayIso } from '../../../todo/todoSchedule'
import { CARE_XP } from '../../greenhouseLevel'
import type { PassportNowState } from '../../passportNow'
import { Body, Go, Label, Line, Mark, Root } from './PassportNow.styles'

function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000)
}

/** The strip under a passport's name: care just done, the activity it was opened from, or the owner's next care. */
export function PassportNow({ now }: { now: PassportNowState }) {
  const { t, tr } = useI18n()

  if (now.kind === 'done') {
    const line = (now.care === 'photo' ? t.http.donePhoto : t.http.doneWater).replace('{xp}', String(CARE_XP))
    return (
      <Root $tone={now.care} data-passport-now="done">
        <Mark>
          <TodoKindIcon kind={now.care} size={18} mark />
        </Mark>
        <Body>
          <Label>{t.passport.nowDone}</Label>
          <Line>{line}</Line>
        </Body>
      </Root>
    )
  }

  if (now.kind === 'moment') {
    return (
      <Root $tone="moment" data-passport-now="moment">
        <Body>
          <Label>{t.passport.nowFrom}</Label>
          <Line>{tr(now.update.body, now.update.bodyHe)}</Line>
        </Body>
      </Root>
    )
  }

  if (now.kind === 'clear') {
    return (
      <Root $tone="calm" data-passport-now="clear">
        <Body>
          <Label>{t.passport.nowNext}</Label>
          <Line>{t.passport.todoEmptyPlanned}</Line>
        </Body>
      </Root>
    )
  }

  const { todo, first } = now
  const late = todo.dueOn ? daysBetween(todo.dueOn, todayIso()) : 0
  const when = first
    ? t.passport.todoFirstWater
    : late > 0
      ? t.todo.statusOverdue.replace('{n}', String(late))
      : late === 0
        ? t.todo.statusToday
        : t.passport.todoDue.replace('{day}', todo.dueOn ?? '—')
  return (
    <Root as={Link} to={`/tasks/${todo.id}`} $tone={todo.subcategory} $late={late > 0} data-passport-now="next">
      <Mark>
        <TodoKindIcon kind={todo.subcategory} size={18} mark />
      </Mark>
      <Body>
        <Label>{t.passport.nowNext}</Label>
        <Line>
          {todo.subcategory === 'photo' ? t.todo.actionPhoto : t.todo.actionWater} · {when}
        </Line>
      </Body>
      <Go aria-hidden>›</Go>
    </Root>
  )
}
