import type { CSSProperties } from 'react'
import { Avatar } from '../../../../components/Avatar/Avatar'
import { useI18n } from '../../../../i18n/I18nProvider'
import { OwnerBadge, Ring, RingNumber, Root } from './LevelBadge.styles'

/**
 * Greenhouse level as a ring that fills toward the next level, with the grower's avatar pinned to it.
 * Used by the level card (`md`) and the Global greenhouse cards (`sm`).
 */
export function LevelBadge({
  level,
  progress,
  owner,
  size = 'md',
}: {
  level: number
  /** 0..1 through the current level. */
  progress: number
  owner?: { name: string; color: string; icon?: string }
  size?: 'sm' | 'md'
}) {
  const { t } = useI18n()
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
      {owner ? (
        <OwnerBadge $size={size} title={owner.name}>
          <Avatar name={owner.name} color={owner.color} icon={owner.icon} size={size === 'sm' ? 20 : 28} />
        </OwnerBadge>
      ) : null}
    </Root>
  )
}
