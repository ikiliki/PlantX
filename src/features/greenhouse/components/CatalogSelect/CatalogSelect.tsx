import { Field, Select } from '../../../../components/Form/Form'
import { Root } from './CatalogSelect.styles'

export type CatalogSelectOption = {
  id: string
  label: string
}

export function CatalogSelect({
  label,
  value,
  onChange,
  options,
  required,
  disabled,
  chooseLabel,
  ariaLabel,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: CatalogSelectOption[]
  required?: boolean
  disabled?: boolean
  chooseLabel: string
  ariaLabel?: string
}) {
  return (
    <Root>
      <Field>
        {label}
        <Select
          value={value}
          required={required}
          disabled={disabled}
          aria-label={ariaLabel ?? label}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">{chooseLabel}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>
    </Root>
  )
}
