import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { RarityChip } from '../../../../components/RarityChip/RarityChip'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { Species } from '../../../../mock/types'
import { speciesName } from '../../../market/categoryData'
import { speciesPhoto } from '../../speciesPhoto'
import { wikiHref } from '../GuideLink/GuideLink'
import { Body, Card, Meta, Name, Photo, Scientific } from './WikiCard.styles'

export function WikiCard({ species }: { species: Species }) {
  const { db } = useStore()
  const { t, tr, locale } = useI18n()
  const name = speciesName(species, locale)

  return (
    <Card to={wikiHref(species.id)}>
      <Photo>
        <PlantImage src={speciesPhoto(db, species.id)} alt="" />
      </Photo>
      <Body>
        <Name>{name}</Name>
        <Scientific>{species.scientificName}</Scientific>
        <Meta>
          <RarityChip rarity={species.rarity} />
          <span>
            {t.plant.growthTime}: {tr(species.growthTime.en, species.growthTime.he)}
          </span>
        </Meta>
      </Body>
    </Card>
  )
}
