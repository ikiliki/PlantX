import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import {
  Count,
  Empty,
  PlantGrid,
  PlantName,
  PlantThumb,
  PlantTile,
  Root,
  Section,
  SectionHead,
  SeeFace,
  SeeGreenhouse,
  SeeLabel,
  SeeMark,
  TileMeta,
} from './GreenhousePublic.styles'

export function GreenhousePublic({
  ownerId,
  compact = false,
}: {
  ownerId: string
  /** Tighter scroll for dialog / seller overlay. */
  compact?: boolean
}) {
  const { db } = useStore()
  const { t, tr } = useI18n()

  const plants = db.plants.filter((p) => p.ownerId === ownerId && p.status !== 'sold').slice().reverse()

  return (
    <Root $compact={compact}>
      <Section>
        <SectionHead>
          <h3>{t.seller.greenhouse}</h3>
          <Count>{plants.length}</Count>
        </SectionHead>
        {plants.length ? (
          <PlantGrid>
            {plants.map((plant) => {
              const title = tr(plant.title, plant.titleHe)
              return (
                <PlantTile key={plant.id} title={title}>
                  <PlantThumb>
                    <PlantImage src={plant.photos[0]} alt="" />
                  </PlantThumb>
                  <PlantName>{title}</PlantName>
                  <TileMeta />
                </PlantTile>
              )
            })}
            {compact && (
              <SeeGreenhouse to={`/profile/${ownerId}`}>
                <SeeFace>
                  <SeeMark aria-hidden>›</SeeMark>
                  <SeeLabel>{t.seller.seeProfile}</SeeLabel>
                </SeeFace>
              </SeeGreenhouse>
            )}
          </PlantGrid>
        ) : (
          <Empty>{t.seller.greenhouseEmpty}</Empty>
        )}
      </Section>
    </Root>
  )
}
