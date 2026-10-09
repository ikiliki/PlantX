import { Icon } from '../../../../components/Icon/Icon'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { RarityChip } from '../../../../components/RarityChip/RarityChip'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { Species } from '../../../../mock/types'
import { speciesName } from '../../../market/categoryData'
import { speciesPhoto } from '../../speciesPhoto'
import { Care, CareItem, Name, Photo, Root } from './CatalogTile.styles'

/** One catalog species in the photo grid: photo, name, then light, water and rarity. Opens the quick preview. */
export function CatalogTile({ species, onOpen }: { species: Species; onOpen: () => void }) {
  const { tr, locale } = useI18n()
  const { db } = useStore()
  const light = tr(species.conditions.light, species.conditions.lightHe)
  const water = tr(species.conditions.water, species.conditions.waterHe)

  return (
    <Root type="button" onClick={onOpen} aria-haspopup="dialog" data-catalog-tile={species.id} data-rarity={species.rarity}>
      <Photo>
        <PlantImage src={speciesPhoto(db, species.id)} alt="" loading="lazy" />
      </Photo>
      <Name>{speciesName(species, locale)}</Name>
      <Care>
        <CareItem title={light}>
          <Icon name="light" size={14} />
          <span>{light}</span>
        </CareItem>
        <CareItem title={water}>
          <Icon name="drop" size={14} />
          <span>{water}</span>
        </CareItem>
        <RarityChip rarity={species.rarity} />
      </Care>
    </Root>
  )
}
