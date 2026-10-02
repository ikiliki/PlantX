import type { ReactNode } from 'react'
import { Icon, type IconName } from '../Icon/Icon'
import { Bar, Chip, Count } from './FilterChips.styles'

export type FilterChipOption<T extends string> = {
  id: T
  label: string
  count?: number
  icon?: IconName
  /** Any icon element, when the shared icon set has no match. */
  iconNode?: ReactNode
}

/**
 * One row of filter chips that scrolls sideways on a phone and never wraps.
 * Greenhouse filters and the Home feed filters share it.
 */
export function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  /** Accessible name for the row. */
  label: string
  options: FilterChipOption<T>[]
  value: T
  onChange: (id: T) => void
}) {
  return (
    <Bar role="tablist" aria-label={label}>
      {options.map((item) => (
        <Chip
          key={item.id}
          type="button"
          role="tab"
          aria-selected={value === item.id}
          $on={value === item.id}
          onClick={() => onChange(item.id)}
        >
          {item.iconNode ?? (item.icon ? <Icon name={item.icon} size={14} /> : null)}
          {item.label}
          {item.count != null ? <Count>({item.count})</Count> : null}
        </Chip>
      ))}
    </Bar>
  )
}
