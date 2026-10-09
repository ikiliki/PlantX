import { Link } from 'react-router-dom'
import { Avatar } from '../../../../components/Avatar/Avatar'
import { Icon } from '../../../../components/Icon/Icon'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { SkeletonBar } from '../../../../components/Skeleton/Skeleton'
import { useI18n } from '../../../../i18n/I18nProvider'
import { publicGrowerName } from '../../../profile/avatarIcons'
import type { Plant, User } from '../../../../mock/types'
import type { GreenhouseLevel } from '../../greenhouseLevel'
import { LevelBadge } from '../LevelBadge/LevelBadge'
import { VerifiedStamp } from '../VerifiedStamp/VerifiedStamp'
import {
  BadgeSlot,
  Bio,
  CardLink,
  CardShell,
  Copy,
  EmptyTile,
  LevelLine,
  Meta,
  Name,
  NameRow,
  PlantTile,
  Shelf,
} from './GreenhouseCard.styles'

const SHELF = 3

/** A grower's public greenhouse, yours included: tapping yourself shows what others see. */
export function greenhouseHref(userId: string, _currentUserId?: string | null) {
  return `/greenhouse/${userId}`
}

/** Up to three living plants with a photo, for the card shelf. */
export function greenhouseShelf(plants: Plant[], ownerId: string) {
  return plants
    .filter((plant) => plant.ownerId === ownerId && (plant.status === 'owned' || plant.status === 'listed') && plant.photos[0])
    .slice(0, SHELF)
    .map((plant) => ({ id: plant.id, src: plant.photos[0] }))
}

/** The same row with a bare ring, bars and empty tiles. Not a link; no data. */
/** Same shape as a loaded card (#77): the 44px level ring, name, level line, region and count, shelf. */
export function GreenhouseCardSkeleton() {
  return (
    <CardShell aria-hidden $compact={false} data-greenhouse-skeleton>
      <BadgeSlot $compact={false}>
        <SkeletonBar width="44px" height={44} round />
      </BadgeSlot>
      <Copy $stamp={false}>
        <SkeletonBar width="55%" height={16} />
        <SkeletonBar width="35%" height={12} />
        <SkeletonBar width="60%" height={12} />
      </Copy>
      <Shelf aria-hidden $compact={false}>
        {Array.from({ length: SHELF }, (_, index) => (
          <EmptyTile key={index} $compact={false}>
            <Icon name="greenhouse" size={16} />
          </EmptyTile>
        ))}
      </Shelf>
    </CardShell>
  )
}

/**
 * A greenhouse. Full size (the Global list): a mosaic of up to three plants on top, the grower's level ring on
 * its edge, then name, rank, place and bio. Compact (the Home rail): one row with a small shelf under it.
 */
export function GreenhouseCard({
  user,
  href,
  plantCount,
  photos = [],
  detail,
  verified = false,
  compact = false,
  level,
}: {
  user: User
  href: string
  plantCount: number
  photos?: { id: string; src: string }[]
  /** Replaces the region and plant count line. */
  detail?: string
  verified?: boolean
  compact?: boolean
  /** Greenhouse level: the avatar sits on the level ring, and the rank shows under the name. */
  level?: GreenhouseLevel
}) {
  const { t, tr, locale } = useI18n()
  const name = user.businessName
    ? tr(user.businessName, user.businessNameHe ?? user.businessName)
    : publicGrowerName(user, locale === 'he')
  const region = tr(user.region, user.regionHe)
  const meta = detail ?? `${region} · ${(plantCount === 1 ? t.greenhouse.directoryPlantsOne : t.greenhouse.directoryPlants.replace('{n}', String(plantCount)))}`
  const bio = tr(user.bio, user.bioHe)
  const shelf = photos.slice(0, SHELF)
  const empty = SHELF - shelf.length

  return (
    <CardLink to={href} $compact={compact} data-greenhouse={user.id} data-verified={verified ? 'true' : undefined}>
      {verified && !compact ? <VerifiedStamp /> : null}
      <BadgeSlot $compact={compact}>
        {level ? (
          <LevelBadge
            level={level.level}
            progress={level.progress}
            owner={{ name, color: user.avatarColor, icon: user.avatarIcon }}
            size="sm"
          />
        ) : (
          <Avatar name={name} color={user.avatarColor} icon={user.avatarIcon} size={compact ? 28 : 36} />
        )}
      </BadgeSlot>
      <Copy $stamp={verified && compact}>
        <NameRow>
          <Name>{name}</Name>
          {verified && compact ? <VerifiedStamp place="icon" /> : null}
        </NameRow>
        {level ? (
          <LevelLine>
            {t.greenhouse.levelN.replace('{n}', String(level.level))} ·{' '}
            {t.greenhouse[`levelRank${level.rank}` as keyof typeof t.greenhouse] as string}
          </LevelLine>
        ) : null}
        <Meta>{meta}</Meta>
        {!compact && bio ? <Bio>{bio}</Bio> : null}
      </Copy>
      <Shelf aria-hidden $compact={compact}>
        {shelf.map((photo) => (
          <PlantTile key={photo.id} $compact={compact}>
            <PlantImage src={photo.src} alt="" />
          </PlantTile>
        ))}
        {Array.from({ length: empty }, (_, index) => (
          <EmptyTile key={`empty-${index}`} $compact={compact}>
            <Icon name="greenhouse" size={compact ? 14 : 16} />
          </EmptyTile>
        ))}
      </Shelf>
    </CardLink>
  )
}
