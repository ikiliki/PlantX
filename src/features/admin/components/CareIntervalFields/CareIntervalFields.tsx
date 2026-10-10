import { Input } from '../../../../components/Form/Form'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { CareRule } from '../../../../mock/types'
import { Check, Numbers, Root, Toggle } from './CareIntervalFields.styles'

const SEASON = [3, 4, 5, 6, 7, 8, 9]

/**
 * An interval in the admin's care forms: a switch for "has an interval" (off means "none" — owners set it,
 * or the task default for a rule), then every N days, an optional winter interval and March–September only.
 */
export function CareIntervalFields({
  value,
  onChange,
  offLabel,
}: {
  value?: CareRule
  onChange: (next: CareRule | undefined) => void
  /** What no interval means here: "No default (owners set it)" or "Use the task default". */
  offLabel: string
}) {
  const { t } = useI18n()
  return (
    <Root>
      <Toggle>
        <input
          type="radio"
          checked={!value}
          onChange={() => onChange(undefined)}
        />
        {offLabel}
      </Toggle>
      <Toggle>
        <input
          type="radio"
          checked={Boolean(value)}
          onChange={() => onChange(value ?? { everyDays: 7 })}
        />
        {t.admin.careSetInterval}
      </Toggle>
      {value ? (
        <Numbers>
          <label>
            {t.admin.careEveryDays}
            <Input
              type="number"
              min={1}
              max={1095}
              value={value.everyDays}
              onChange={(event) => onChange({ ...value, everyDays: Math.max(1, Number(event.target.value) || 1) })}
            />
          </label>
          <label>
            {t.admin.careWinterDays}
            <Input
              type="number"
              min={1}
              max={1095}
              value={value.winterEveryDays ?? ''}
              onChange={(event) => {
                const { winterEveryDays: _drop, ...rest } = value
                const days = Number(event.target.value)
                onChange(days > 0 ? { ...rest, winterEveryDays: days } : rest)
              }}
            />
          </label>
          <Check>
            <input
              type="checkbox"
              checked={Boolean(value.months)}
              onChange={(event) => {
                const { months: _drop, ...rest } = value
                onChange(event.target.checked ? { ...rest, months: SEASON } : rest)
              }}
            />
            {t.admin.careSeasonOnly}
          </Check>
        </Numbers>
      ) : null}
    </Root>
  )
}
