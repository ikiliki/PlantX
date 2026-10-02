import { PlantImage } from '../PlantImage/PlantImage'
import { Chip, ChipHint, ChipPhoto, ChipText, ChipThumb, Empty, Group, Legend, MoreChip, Required, Suggested } from './ChoiceChips.styles'

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
  more,
  emptyLabel,
  onPick,
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
  /** Sits in the chip row. Used for Show more / Show less. */
  more?: { label: string; onMore: () => void }
  /** Shown in the empty row, e.g. why there are no options yet. */
  emptyLabel?: string
  /** When set, a tap hands the option here (e.g. to open a preview) instead of selecting it. */
  onPick?: (id: string) => void
}) {
  return (
    <Group disabled={disabled}>
      <Legend>
        {label}
        {required ? <Required aria-hidden>*</Required> : null}
      </Legend>
      <div role="radiogroup" aria-label={label} aria-required={required} data-layout={layout}>
        {options.length === 0 ? <Empty>{emptyLabel}</Empty> : null}
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
              onClick={() => (onPick ? onPick(option.id) : onChange(on && !required ? '' : option.id))}
            >
              {layout === 'tiles' ? (
                <ChipPhoto>{option.photo ? <PlantImage src={option.photo} alt="" /> : null}</ChipPhoto>
              ) : option.photo ? (
                <ChipThumb>
                  <PlantImage src={option.photo} alt="" />
                </ChipThumb>
              ) : null}
              <ChipText>
                {option.label}
                {option.hint ? <ChipHint>{option.hint}</ChipHint> : null}
              </ChipText>
              {suggested && suggestedLabel ? <Suggested>{suggestedLabel}</Suggested> : null}
            </Chip>
          )
        })}
        {more ? (
          <MoreChip type="button" onClick={more.onMore}>
            {more.label}
          </MoreChip>
        ) : null}
      </div>
    </Group>
  )
}
