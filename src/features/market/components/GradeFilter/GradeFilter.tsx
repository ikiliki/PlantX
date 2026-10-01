import { useI18n } from '../../../../i18n/I18nProvider'
import { gradeTone } from '../../gradeTone'
import { Group, Pill } from './GradeFilter.styles'

export type GradeOption = { grade: string; count: number }

export function GradeFilter({
  options,
  value,
  onChange,
}: {
  options: GradeOption[]
  value: string
  onChange: (grade: string) => void
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
          key={option.grade}
          type="button"
          $on={value === option.grade}
          aria-pressed={value === option.grade}
          onClick={() => onChange(option.grade)}
        >
          <i style={{ background: gradeTone(option.grade).strong }} />
          {t.market.filterGrade} {option.grade} <small>{option.count}</small>
        </Pill>
      ))}
    </Group>
  )
}
