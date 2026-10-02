import { useState } from 'react'
import { FeatureGate } from '../../../../components/FeatureGate/FeatureGate'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { speciesName } from '../../../market/categoryData'
import { catalogSpeciesList } from '../../../species/catalogSpecies'
import { CatalogPreview } from '../../../species/components/CatalogPreview/CatalogPreview'
import { wikiHref } from '../../../species/components/GuideLink/GuideLink'
import { speciesPhoto } from '../../../species/speciesPhoto'
import { Empty, Expand, Head, Heading, Line, Name, Panel, Row, Thumb } from './WikiRail.styles'

const RAIL_LIMIT = 4

export function WikiRail() {
  const { t, tr, locale } = useI18n()
  const { db } = useStore()
  const [openId, setOpenId] = useState<string | null>(null)
  const rows = catalogSpeciesList(db).slice(0, RAIL_LIMIT)

  return (
    <FeatureGate placement="home.wiki" title={t.guide.wiki}>
      <Panel aria-label={t.guide.wiki}>
        <Head>
          <Heading>{t.guide.wiki}</Heading>
          <Expand to={wikiHref()}>{t.market.expand}</Expand>
        </Head>
        {rows.length === 0 && <Empty>{t.guide.empty}</Empty>}
        {rows.map((species) => (
          <Row key={species.id} type="button" onClick={() => setOpenId(species.id)}>
            <Thumb>
              <PlantImage src={speciesPhoto(db, species.id)} alt="" />
            </Thumb>
            <Name>{speciesName(species, locale)}</Name>
            <Line>
              {tr(species.growthTime.en, species.growthTime.he)} · {tr(species.conditions.light, species.conditions.lightHe)}
            </Line>
          </Row>
        ))}
      </Panel>
      {openId ? <CatalogPreview speciesId={openId} onClose={() => setOpenId(null)} /> : null}
    </FeatureGate>
  )
}
