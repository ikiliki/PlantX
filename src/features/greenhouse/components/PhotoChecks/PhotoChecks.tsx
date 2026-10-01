import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { PhotoCheck } from '../../../../mock/types'
import { PhotoCheckSticker } from '../PhotoCheckSticker/PhotoCheckSticker'
import { Index, Item, Root, Sticker, Thumb } from './PhotoChecks.styles'

/** A plant's photos, each stamped with its own AI check. Photos without a check show no sticker. */
export function PhotoChecks({
  photos,
  checks = [],
  size = 'md',
}: {
  photos: string[]
  checks?: PhotoCheck[]
  size?: 'sm' | 'md'
}) {
  const { t } = useI18n()
  if (photos.length === 0) return null
  return (
    <Root $size={size} aria-label={t.addPlant.photoChecksLabel}>
      {photos.map((photo, position) => {
        const check = checks.find((item) => item.position === position)
        return (
          <Item key={`${position}-${photo.slice(-24)}`}>
            <Thumb>
              <PlantImage src={photo} alt={t.addPlant.stickerPhoto.replace('{n}', String(position + 1))} />
              {photos.length > 1 ? <Index aria-hidden>{position + 1}</Index> : null}
              {check ? (
                <Sticker>
                  <PhotoCheckSticker check={check} />
                </Sticker>
              ) : null}
            </Thumb>
          </Item>
        )
      })}
    </Root>
  )
}
