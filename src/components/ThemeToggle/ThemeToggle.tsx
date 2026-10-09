import { Icon } from '../Icon/Icon'
import { setGarden, useGarden } from '../../theme/themeMode'
import { Glyph, Toggle } from './ThemeToggle.styles'

/** Sunny garden ↔ night garden. The new garden spreads out from the button. */
export function ThemeToggle({ toNight, toDay }: { toNight: string; toDay: string }) {
  const garden = useGarden()
  const night = garden === 'night'
  const label = night ? toDay : toNight

  return (
    <Toggle
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={night}
      onClick={(event) => {
        const box = event.currentTarget.getBoundingClientRect()
        setGarden(night ? 'day' : 'night', { x: box.left + box.width / 2, y: box.top + box.height / 2 })
      }}
    >
      <Glyph $shown={!night} aria-hidden>
        <Icon name="sun" size={20} />
      </Glyph>
      <Glyph $shown={night} aria-hidden>
        <Icon name="moon" size={20} />
      </Glyph>
    </Toggle>
  )
}
