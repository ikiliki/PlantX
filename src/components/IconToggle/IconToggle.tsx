import { createPortal } from 'react-dom'
import { Icon, type IconName } from '../Icon/Icon'
import { Btn, Root } from './IconToggle.styles'

export type IconToggleOption<T extends string> = {
  id: T
  label: string
  icon: IconName
}

/**
 * Icon-only segmented switch. `floating` pins it in the middle, above the bottom nav.
 * Greenhouse (mine / global) and the home feed (all / activities / tasks) share it.
 * The floating pill is portaled to `document.body` so the page-enter transform on `<main>`
 * cannot hold it mid-screen and drop it down when the motion ends.
 */
export function IconToggle<T extends string>({
  label,
  value,
  onChange,
  options,
  floating = false,
}: {
  /** Accessible name for the group. Each option keeps its own label. */
  label: string
  value: T
  onChange: (value: T) => void
  options: IconToggleOption<T>[]
  floating?: boolean
}) {
  const toggle = (
    <Root role="radiogroup" aria-label={label} $floating={floating} $count={options.length}>
      {options.map((option) => (
        <Btn
          key={option.id}
          type="button"
          role="radio"
          aria-label={option.label}
          aria-checked={value === option.id}
          $on={value === option.id}
          onClick={() => onChange(option.id)}
        >
          <Icon name={option.icon} size={16} />
        </Btn>
      ))}
    </Root>
  )
  if (floating && typeof document !== 'undefined') return createPortal(toggle, document.body)
  return toggle
}
