import { PlantImage } from '../PlantImage/PlantImage'
import { Chip, ChipHint, ChipPhoto, ChipText, Group, Legend, Required, Suggested } from './ChoiceChips.styles'

export type ChoiceChipOption = {
  id: string
  label: string
  hint?: string
  photo?: string
}

/** Single choice as tappable chips, or photo tiles. A suggested option carries a small mark. */
export function ChoiceChips({
  label,
  options,
  value,
  onChange,
  required,
  disabled,
  suggestedId,
  suggestedLabel,
  layout = 'chips',
}: {
  label: string
  options: ChoiceChipOption[]
  value: string
  onChange: (id: string) => void
  required?: boolean
  disabled?: boolean
  suggestedId?: string
  suggestedLabel?: string
  layout?: 'chips' | 'tiles'
}) {
  return (
    <Group disabled={disabled}>
      <Legend>
        {label}
        {required ? <Required aria-hidden>*</Required> : null}
      </Legend>
      <div role="radiogroup" aria-label={label} aria-required={required} data-layout={layout}>
        {options.map((option, index) => {
          const on = option.id === value
          const suggested = Boolean(suggestedId) && option.id === suggestedId
          return (
            <Chip
              key={option.id}
              type="button"
              role="radio"
              aria-checked={on}
              $on={on}
              $tile={layout === 'tiles'}
              $suggested={suggested}
              style={{ animationDelay: `${Math.min(index, 12) * 28}ms` }}
              onClick={() => onChange(on && !required ? '' : option.id)}
            >
              {layout === 'tiles' ? (
                <ChipPhoto>{option.photo ? <PlantImage src={option.photo} alt="" /> : null}</ChipPhoto>
              ) : null}
              <ChipText>
                {option.label}
                {option.hint ? <ChipHint>{option.hint}</ChipHint> : null}
              </ChipText>
              {suggested && suggestedLabel ? <Suggested>{suggestedLabel}</Suggested> : null}
            </Chip>
          )
        })}
      </div>
    </Group>
  )
}
