import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { PlantImage } from '../PlantImage/PlantImage'
import { Chip, ChipHint, MissingNote, ChipPhoto, ChipText, ChipThumb, Empty, Group, Legend, MoreChip, Required, Suggested, Tip } from './ChoiceChips.styles'

export type ChoiceChipOption = {
  id: string
  label: string
  hint?: string
  photo?: string
  /** Short catalog note. Hover shows it; a click on that note can open the full card. */
  tip?: string
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
  onTip,
  missing,
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
  /** Click on the hover note, not the chip. */
  onTip?: (id: string) => void
  /** Required and still empty after an answer that should have filled it: tinted, with this short note. */
  missing?: string
}) {
  const [hover, setHover] = useState<{ id: string; text: string; top: number; left: number; above: boolean } | null>(null)
  const hideTimer = useRef<number | null>(null)
  const clearHide = () => {
    if (hideTimer.current != null) window.clearTimeout(hideTimer.current)
    hideTimer.current = null
  }
  const showTip = (id: string, text: string, rect: DOMRect) => {
    clearHide()
    const above = rect.top > 72
    setHover({
      id,
      text,
      top: above ? rect.top - 4 : rect.bottom + 4,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - 188)),
      above,
    })
  }
  const hideTip = () => {
    clearHide()
    hideTimer.current = window.setTimeout(() => setHover(null), 160)
  }
  return (
    <Group disabled={disabled} data-missing={missing ? 'true' : undefined}>
      <Legend>
        {label}
        {required ? <Required aria-hidden>*</Required> : null}
        {missing ? <MissingNote>{missing}</MissingNote> : null}
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
              onMouseEnter={(event) => {
                if (!option.tip) return
                showTip(option.id, option.tip, event.currentTarget.getBoundingClientRect())
              }}
              onMouseLeave={hideTip}
              onClick={() => {
                clearHide()
                setHover(null)
                if (onPick) onPick(option.id)
                else onChange(on && !required ? '' : option.id)
              }}
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
      {hover
        ? createPortal(
            <Tip
              type="button"
              $above={hover.above}
              style={{ top: hover.top, left: hover.left, transform: hover.above ? 'translateY(-100%)' : undefined }}
              onMouseEnter={clearHide}
              onMouseLeave={hideTip}
              onClick={() => {
                const id = hover.id
                clearHide()
                setHover(null)
                onTip?.(id)
              }}
            >
              {hover.text}
            </Tip>,
            document.body,
          )
        : null}
    </Group>
  )
}
