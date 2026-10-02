import { useI18n } from '../../../../i18n/I18nProvider'
import { healthTone } from '../../healthTone'
import { Group, Pill } from './HealthFilter.styles'

export type HealthOption = { health: string; count: number }

export function HealthFilter({
  options,
  value,
  onChange,
}: {
  options: HealthOption[]
  value: string
  onChange: (health: string) => void
}) {
  const { t } = useI18n()
  const total = options.reduce((sum, option) => sum + option.count, 0)

  return (
    <Group role="group" aria-label={t.charts.grades}>
      <Pill type="button" $on={value === 'all'} aria-pressed={value === 'all'} onClick={() => onChange('all')}>
        {t.charts.allGrades} <small>{total}</small>
      </Pill>
      {options.map((option) => (
        <Pill
          key={option.health}
          type="button"
          $on={value === option.health}
          aria-pressed={value === option.health}
          onClick={() => onChange(option.health)}
        >
          <i style={{ background: healthTone(option.health).strong }} />
          {t.market.filterGrade} {option.health} <small>{option.count}</small>
        </Pill>
      ))}
    </Group>
  )
}
