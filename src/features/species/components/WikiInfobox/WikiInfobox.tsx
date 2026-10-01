import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { RarityChip } from '../../../../components/RarityChip/RarityChip'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { isPlacementReady } from '../../../../theme/release'
import type { Species } from '../../../../mock/types'
import { speciesName } from '../../../market/categoryData'
import { speciesPhoto } from '../../speciesPhoto'
import { Box, Caption, Photo, Row, Rows } from './WikiInfobox.styles'

export function WikiInfobox({ species }: { species: Species }) {
  const { db } = useStore()
  const { t, tr, locale } = useI18n()
  const name = speciesName(species, locale)
  const grown = db.plants.filter((plant) => plant.speciesId === species.id && plant.status !== 'sold')
  const supply = db.marketClasses
    .filter((item) => item.speciesId === species.id)
    .reduce((sum, item) => sum + item.supplyUnits, 0)
  const marketOn = isPlacementReady(db.system, 'market.board')

  return (
    <Box aria-label={name}>
      <Caption>{name}</Caption>
      <Photo>
        <PlantImage src={speciesPhoto(db, species.id)} alt="" />
      </Photo>
      <Rows>
        <Row>
          <dt>{t.guide.scientific}</dt>
          <dd>
            <em>{species.scientificName}</em>
          </dd>
        </Row>
        <Row>
          <dt>{t.plant.rarity}</dt>
          <dd>
            <RarityChip rarity={species.rarity} />
          </dd>
        </Row>
        <Row>
          <dt>{t.guide.ticker}</dt>
          <dd>{species.ticker}</dd>
        </Row>
        <Row>
          <dt>{t.plant.growthTime}</dt>
          <dd>{tr(species.growthTime.en, species.growthTime.he)}</dd>
        </Row>
        <Row>
          <dt>{t.plant.light}</dt>
          <dd>{tr(species.conditions.light, species.conditions.lightHe)}</dd>
        </Row>
        <Row>
          <dt>{t.plant.water}</dt>
          <dd>{tr(species.conditions.water, species.conditions.waterHe)}</dd>
        </Row>
        <Row>
          <dt>{t.guide.inGreenhouses}</dt>
          <dd>{grown.reduce((sum, plant) => sum + plant.quantity, 0).toLocaleString()}</dd>
        </Row>
        {marketOn && (
          <Row>
            <dt>{t.guide.onMarket}</dt>
            <dd>{supply.toLocaleString()}</dd>
          </Row>
        )}
      </Rows>
    </Box>
  )
}
