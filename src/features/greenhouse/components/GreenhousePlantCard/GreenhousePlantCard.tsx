import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { isPlacementEnabled, isPlacementReady } from '../../../../theme/release'
import { isPhotoStale, isWaterDue } from '../../plantCare'
import type { Plant } from '../../../../mock/types'
import { PlantCatalogMark } from '../CatalogMark/CatalogMark'
import { IdentifyBadge } from '../IdentifyBadge/IdentifyBadge'
import {
  CollectionGrid,
  Details,
  Name,
  NameRow,
  PassportMark,
  Photo,
  PhotoCount,
  PhotoLink,
  Root,
  StatusMark,
  Tags,
} from './GreenhousePlantCard.styles'

export { CollectionGrid }

function statusFor(
  plant: Plant,
  marketOpen: boolean,
  t: ReturnType<typeof useI18n>['t'],
): { label: string; tone: 'warm' | 'fresh' | 'calm' | 'due' } {
  if (isWaterDue(plant)) return { label: t.greenhouse.badgeWaterDue, tone: 'due' }
  if (isPhotoStale(plant)) return { label: t.greenhouse.badgePhotoDue, tone: 'due' }
  if (plant.status === 'listed') {
    return {
      label: marketOpen ? t.greenhouse.cardListed : t.greenhouse.pendingMarket,
      tone: 'fresh',
    }
  }
  return { label: t.greenhouse.badgeGrowing, tone: 'calm' }
}

/** Shelf card. Care and market actions live in the passport and the "today" list, not here. */
export function GreenhousePlantCard({
  plant,
  fresh,
}: {
  plant: Plant
  /** Just added: the card glows once. */
  fresh?: boolean
}) {
  const { db } = useStore()
  const { t, tr } = useI18n()
  const marketOpen = isPlacementReady(db.system, 'market.board')
  const cardOn = isPlacementEnabled(db.system, 'greenhouse.card')
  if (!cardOn) return null

  const status = statusFor(plant, marketOpen, t)
  const verified = Boolean(plant.verifiedAt)
  const photos = plant.photos.filter(Boolean)

  return (
    <Root $fresh={fresh}>
      <PhotoLink to={`/plants/${plant.id}`} aria-haspopup="dialog">
        <Photo $stale={isPhotoStale(plant)}>
          <PlantImage src={photos[0]} alt="" />
          <StatusMark $tone={status.tone}>{status.label}</StatusMark>
          {photos.length > 1 ? (
            <PhotoCount title={t.addPlant.photosCount.replace('{n}', String(photos.length))}>
              <span aria-hidden>▣</span> +{photos.length - 1}
            </PhotoCount>
          ) : null}
        </Photo>
      </PhotoLink>
      <Details>
        <NameRow>
          <PlantCatalogMark plant={plant} size={24} />
          <Name to={`/plants/${plant.id}`}>{tr(plant.title, plant.titleHe)}</Name>
        </NameRow>
        <Tags>
          <IdentifyBadge identification={plant.identification} compact />
          {verified ? <PassportMark>✓ {t.greenhouse.passportOk}</PassportMark> : null}
        </Tags>
      </Details>
    </Root>
  )
}
