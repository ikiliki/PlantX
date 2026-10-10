import { Input, Select } from '../../../../components/Form/Form'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { CarePlan, CareRule, TodoSubcategory } from '../../../../mock/types'
import { CARE_KINDS, DEFAULT_CARE } from '../../../todo/carePlan'
import { careKindName } from '../../../todo/careKinds'
import { TodoKindIcon } from '../../../todo/components/TodoKindIcon/TodoKindIcon'
import { Check, Hint, Kind, Numbers, Root, Row } from './CarePlanFields.styles'

const SEASON = [3, 4, 5, 6, 7, 8, 9]

type Mode = 'default' | 'custom' | 'off'

/**
 * A catalog category's or variety's care plan in the admin editor: per kind, Default (PlantX's standard,
 * or the category for a variety), a custom interval (optional winter interval, optional March–September
 * season), or Off. Unset kinds are left out of the plan, so they keep falling back.
 */
export function CarePlanFields({
  value,
  inherited,
  onChange,
}: {
  value?: CarePlan
  /** A variety's category plan: what Default means for it. */
  inherited?: CarePlan
  onChange: (next: CarePlan | undefined) => void
}) {
  const { t } = useI18n()

  const describe = (rule: CareRule | null) => {
    if (!rule) return t.admin.careDefaultOff
    const every = rule.winterEveryDays
      ? t.passport.careEveryWinter.replace('{n}', String(rule.everyDays)).replace('{w}', String(rule.winterEveryDays))
      : t.passport.careEvery.replace('{n}', String(rule.everyDays))
    return t.admin.careDefault.replace('{rule}', rule.months ? `${every} · ${t.admin.careSeasonShort}` : every)
  }

  const set = (kind: TodoSubcategory, rule: CareRule | null | undefined) => {
    const next: CarePlan = { ...(value ?? {}) }
    if (rule === undefined) delete next[kind]
    else next[kind] = rule
    onChange(Object.keys(next).length > 0 ? next : undefined)
  }

  return (
    <Root>
      <Hint>{t.admin.careHint}</Hint>
      {CARE_KINDS.map((kind) => {
        const own = value && kind in value ? value[kind] : undefined
        const mode: Mode = own === undefined ? 'default' : own === null ? 'off' : 'custom'
        const base = inherited && kind in inherited ? (inherited[kind] ?? null) : DEFAULT_CARE[kind]
        const name = careKindName(kind, t)
        return (
          <Row key={kind} data-care-field={kind}>
            <Kind>
              <TodoKindIcon kind={kind} size={16} />
              {name}
            </Kind>
            <Select
              aria-label={name}
              value={mode}
              onChange={(event) => {
                const next = event.target.value as Mode
                if (next === 'default') set(kind, undefined)
                else if (next === 'off') set(kind, null)
                else set(kind, base ?? { everyDays: 14 })
              }}
            >
              <option value="default">{describe(base)}</option>
              <option value="custom">{t.admin.careCustom}</option>
              <option value="off">{t.admin.careOff}</option>
            </Select>
            {own ? (
              <Numbers>
                <label>
                  {t.admin.careEveryDays}
                  <Input
                    type="number"
                    min={1}
                    max={730}
                    value={own.everyDays}
                    onChange={(event) => set(kind, { ...own, everyDays: Number(event.target.value) || 1 })}
                  />
                </label>
                <label>
                  {t.admin.careWinterDays}
                  <Input
                    type="number"
                    min={1}
                    max={730}
                    value={own.winterEveryDays ?? ''}
                    onChange={(event) => {
                      const { winterEveryDays: _drop, ...rest } = own
                      const days = Number(event.target.value)
                      set(kind, days > 0 ? { ...rest, winterEveryDays: days } : rest)
                    }}
                  />
                </label>
                <Check>
                  <input
                    type="checkbox"
                    checked={Boolean(own.months)}
                    onChange={(event) => {
                      const { months: _drop, ...rest } = own
                      set(kind, event.target.checked ? { ...rest, months: SEASON } : rest)
                    }}
                  />
                  {t.admin.careSeasonOnly}
                </Check>
              </Numbers>
            ) : null}
          </Row>
        )
      })}
    </Root>
  )
}
