import { Item, Row } from './Segmented.styles'

export type SegmentedOption<T extends string> = {
  id: T
  label: string
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  disabled,
}: {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel: string
  disabled?: boolean
}) {
  return (
    <Row role="radiogroup" aria-label={ariaLabel}>
      {options.map((option) => (
        <Item
          key={option.id}
          type="button"
          role="radio"
          aria-checked={option.id === value}
          $on={option.id === value}
          disabled={disabled}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </Item>
      ))}
    </Row>
  )
}
