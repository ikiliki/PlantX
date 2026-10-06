import type { CSSProperties } from 'react'
import { Avatar } from '../../../../components/Avatar/Avatar'
import { useI18n } from '../../../../i18n/I18nProvider'
import { OwnerBadge, OwnerButton, Ring, RingNumber, Root } from './LevelBadge.styles'

/**
 * Greenhouse level as a ring that fills toward the next level, with the grower's avatar pinned to it.
 * Used by the level card (`md`) and the Global greenhouse cards (`sm`).
 * `onOwner` makes the avatar a button (a grower's public greenhouse opens their profile preview).
 */
export function LevelBadge({
  level,
  progress,
  owner,
  size = 'md',
  onOwner,
}: {
  level: number
  /** 0..1 through the current level. */
  progress: number
  owner?: { name: string; color: string; icon?: string }
  size?: 'sm' | 'md'
  onOwner?: () => void
}) {
  const { t } = useI18n()
  const avatar = owner ? (
    <Avatar name={owner.name} color={owner.color} icon={owner.icon} size={size === 'sm' ? 20 : 28} />
  ) : null
  return (
    <Root $size={size}>
      <Ring
        $size={size}
        role="img"
        aria-label={t.greenhouse.levelN.replace('{n}', String(level))}
        style={{ '--progress': progress } as CSSProperties}
      >
        <RingNumber $size={size}>{level}</RingNumber>
      </Ring>
      {owner && onOwner ? (
        <OwnerButton type="button" $size={size} title={owner.name} aria-label={owner.name} onClick={onOwner} data-owner-avatar>
          {avatar}
        </OwnerButton>
      ) : owner ? (
        <OwnerBadge $size={size} title={owner.name}>
          {avatar}
        </OwnerBadge>
      ) : null}
    </Root>
  )
}
