import { Link } from 'react-router-dom'
import { Avatar } from '../../../../components/Avatar/Avatar'
import { Icon } from '../../../../components/Icon/Icon'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { Plant, User } from '../../../../mock/types'
import type { GreenhouseLevel } from '../../greenhouseLevel'
import { LevelBadge } from '../LevelBadge/LevelBadge'
import { VerifiedStamp } from '../VerifiedStamp/VerifiedStamp'
import { Bio, CardLink, Copy, EmptyTile, LevelLine, Meta, Name, NameRow, PlantTile, Shelf } from './GreenhouseCard.styles'

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

/** A greenhouse row: name, then a shelf of up to three plants. */
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
  const { t, tr } = useI18n()
  const name = user.businessName ? tr(user.businessName, user.businessNameHe ?? user.businessName) : tr(user.name, user.nameHe)
  const region = tr(user.region, user.regionHe)
  const meta = detail ?? `${region} · ${(plantCount === 1 ? t.greenhouse.directoryPlantsOne : t.greenhouse.directoryPlants.replace('{n}', String(plantCount)))}`
  const bio = tr(user.bio, user.bioHe)
  const shelf = photos.slice(0, SHELF)
  const empty = SHELF - shelf.length

  return (
    <CardLink to={href} $compact={compact} data-greenhouse={user.id} data-verified={verified ? 'true' : undefined}>
      {verified && !compact ? <VerifiedStamp /> : null}
      {level ? (
        <LevelBadge
          level={level.level}
          progress={level.progress}
          owner={{ name: user.name, color: user.avatarColor }}
          size="sm"
        />
      ) : (
        <Avatar name={user.name} color={user.avatarColor} size={compact ? 28 : 36} />
      )}
      <Copy $stamp={verified && !compact}>
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
      <Shelf aria-hidden>
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
