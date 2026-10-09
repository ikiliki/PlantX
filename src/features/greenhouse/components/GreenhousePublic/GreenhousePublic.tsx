import { useState } from 'react'
import { EmptyState } from '../../../../components/EmptyState/EmptyState'
import { LoaderShell } from '../../../../components/LoaderShell/LoaderShell'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { PassportDialog } from '../PassportDialog/PassportDialog'
import { useStore } from '../../../../mock/store'
import type { Plant } from '../../../../mock/types'
import { useSectionFetch } from '../../../../mock/useServerSlices'
import {
  Count,
  Empty,
  GoGreenhouse,
  PlantGrid,
  PlantName,
  PlantScroll,
  PlantThumb,
  PlantTile,
  Root,
  RowCopy,
  RowThumb,
  Section,
  SectionHead,
  TileMeta,
  PlantRow,
} from './GreenhousePublic.styles'

/** Preview window shows one fewer plant than they have, and never more than 3. */
const PREVIEW_CAP = 3

function previewRows(count: number) {
  if (count <= 1) return count
  return Math.min(count - 1, PREVIEW_CAP)
}

export function GreenhousePublic({
  ownerId,
  compact = false,
}: {
  ownerId: string
  /** Tighter plant window for the grower popup. */
  compact?: boolean
}) {
  const { db } = useStore()
  const { t, tr } = useI18n()
  const fetching = useSectionFetch(true, ['plants'])
  const [passportId, setPassportId] = useState<string | null>(null)

  const plants = db.plants.filter((p) => p.ownerId === ownerId && p.status !== 'sold').slice().reverse()

  if (fetching) return <LoaderShell busy compact={compact} />

  return (
    <Root $compact={compact}>
      <Section $compact={compact}>
        {/* The popup names the greenhouse; the full page (under the level card) names the shelf. */}
        <SectionHead>
          <h3>{compact ? t.seller.greenhouse : t.greenhouse.shelfTitle}</h3>
          <Count>{plants.length}</Count>
        </SectionHead>
        {plants.length ? (
          compact ? (
            <PlantScroll $rows={previewRows(plants.length)}>
              {plants.map((plant) => (
                <PreviewRow
                  key={plant.id}
                  plant={plant}
                  title={tr(plant.title, plant.titleHe)}
                  meta={plantMeta(db, plant, tr)}
                  onOpen={() => setPassportId(plant.id)}
                />
              ))}
            </PlantScroll>
          ) : (
            <PlantGrid>
              {plants.map((plant) => {
                const title = tr(plant.title, plant.titleHe)
                return (
                  <PlantTile key={plant.id} type="button" title={title} onClick={() => setPassportId(plant.id)}>
                    <PlantThumb>
                      <PlantImage src={plant.photos[0]} alt="" />
                    </PlantThumb>
                    <PlantName>{title}</PlantName>
                    <TileMeta>{plantMeta(db, plant, tr)}</TileMeta>
                  </PlantTile>
                )
              })}
            </PlantGrid>
          )
        ) : compact ? (
          <Empty>{t.seller.greenhouseEmpty}</Empty>
        ) : (
          <EmptyState title={t.seller.greenhouseEmpty} />
        )}
        {compact && <GoGreenhouse to={`/greenhouse/${ownerId}`}>{t.seller.goToGreenhouse}</GoGreenhouse>}
      </Section>
      {passportId && <PassportDialog plantId={passportId} onClose={() => setPassportId(null)} />}
    </Root>
  )
}

function PreviewRow({
  plant,
  title,
  meta,
  onOpen,
}: {
  plant: Plant
  title: string
  meta: string
  onOpen: () => void
}) {
  return (
    <PlantRow type="button" title={title} onClick={onOpen}>
      <RowThumb>
        <PlantImage src={plant.photos[0]} alt="" />
      </RowThumb>
      <RowCopy>
        <PlantName>{title}</PlantName>
        {meta ? <TileMeta>{meta}</TileMeta> : null}
      </RowCopy>
    </PlantRow>
  )
}

function plantMeta(
  db: { marketClasses: { id: string; displayName: string; displayNameHe: string }[] },
  plant: Plant,
  tr: (enText: string, heText: string) => string,
) {
  const market = db.marketClasses.find((item) => item.id === plant.marketClassId)
  return market ? tr(market.displayName, market.displayNameHe) : ''
}
