import { avatarIconId, type AvatarIconId } from '../../features/profile/avatarIcons'
import { Circle, Glyph } from './Avatar.styles'

function Seed({ size }: { size: number }) {
  return (
    <Glyph viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M5 19.5h14" />
      <path d="M12 19.5v-6" />
      <path d="M12 13.5c-3.2-1.6-4.8-4.6-4-7.6 2.6.5 4.2 2.2 4 4.2" />
      <path d="M12 12.6c3-1.2 5.2-3.6 4.6-7-2.8.3-4.4 2.2-4.6 4.2" />
    </Glyph>
  )
}

function IconGlyph({ id, size }: { id: AvatarIconId; size: number }) {
  if (id === 'seed') return <Seed size={size} />
  return <Seed size={size} />
}

/** Grower face. A colored disc and an unlocked icon. The seed is the start. */
export function Avatar({
  name,
  color,
  size = 40,
  icon,
}: {
  name: string
  color: string
  size?: number
  icon?: string
}) {
  const id = avatarIconId(icon)
  return (
    <Circle $color={color} $size={size} title={name} aria-hidden>
      <IconGlyph id={id} size={Math.max(12, Math.round(size * 0.62))} />
    </Circle>
  )
}
