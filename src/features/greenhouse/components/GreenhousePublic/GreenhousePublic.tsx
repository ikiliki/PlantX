import { useState, type MouseEvent } from 'react'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { MarketPeekDialog } from '../../../market/components/MarketPeek/MarketPeek'
import {
  Change,
  Count,
  Empty,
  ListingGrid,
  ListingTile,
  MoreThumb,
  MoreTile,
  PlantGrid,
  PlantName,
  PlantThumb,
  PlantTile,
  Root,
  Section,
  SectionHead,
  TileMeta,
} from './GreenhousePublic.styles'

function scrollRow(event: MouseEvent<HTMLButtonElement>) {
  const row = event.currentTarget.parentElement
  if (!row) return
  const forward = getComputedStyle(row).direction === 'rtl' ? -1 : 1
  row.scrollBy({ left: forward * Math.max(140, row.clientWidth * 0.7), behavior: 'smooth' })
}

function MoreCard({ label }: { label: string }) {
  return (
    <MoreTile type="button" aria-label={label} onClick={scrollRow}>
      <MoreThumb>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 6l6 6-6 6" />
        </svg>
      </MoreThumb>
    </MoreTile>
  )
}

export function GreenhousePublic({
  ownerId,
  compact = false,
}: {
  ownerId: string
  /** Tighter scroll for dialog / seller overlay. */
  compact?: boolean
}) {
  const { db } = useStore()
  const { t, tr, locale, formatMoney } = useI18n()
  const [portfolio, setPortfolio] = useState<{ classId: string; speciesId: string } | null>(null)

  const listings = db.listings.filter((l) => l.sellerId === ownerId && l.status === 'active').slice().reverse()
  const plants = db.plants.filter((p) => p.ownerId === ownerId && p.status !== 'sold').slice().reverse()
  const nextLabel = locale === 'he' ? 'הבא' : 'Next'

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
            <MoreCard label={nextLabel} />
          </PlantGrid>
        ) : (
          <Empty>{t.seller.greenhouseEmpty}</Empty>
        )}
      </Section>

      <Section>
        <SectionHead>
          <h3>{t.market.listings}</h3>
          <Count>{listings.length}</Count>
        </SectionHead>
        {listings.length ? (
          <ListingGrid>
            {listings.map((listing) => {
              const plant = db.plants.find((item) => item.id === listing.plantId)
              if (!plant) return null
              const marketClass = db.marketClasses.find(
                (item) => item.id === listing.marketClassId || item.id === plant.marketClassId,
              )
              const title = marketClass
                ? locale === 'he'
                  ? marketClass.displayNameHe
                  : marketClass.displayName
                : tr(plant.title, plant.titleHe)
              const short = title.split(' · ')[0] || title
              const price = marketClass?.lastPrice ?? listing.price
              const grade = marketClass?.quality ?? plant.quality
              const change = marketClass?.changePct
              return (
                <ListingTile
                  key={listing.id}
                  type="button"
                  aria-label={`${t.market.openPortfolio}: ${short}`}
                  onClick={() => {
                    if (!marketClass) return
                    setPortfolio({ classId: marketClass.id, speciesId: plant.speciesId })
                  }}
                >
                  <PlantThumb>
                    <PlantImage src={plant.photos[0]} alt="" />
                  </PlantThumb>
                  <PlantName>{short}</PlantName>
                  <TileMeta>
                    {formatMoney(price)} · {grade}
                    {change != null && (
                      <Change $up={change >= 0}>
                        {change >= 0 ? '▲' : '▼'}
                        {Math.abs(change).toFixed(1)}%
                      </Change>
                    )}
                  </TileMeta>
                </ListingTile>
              )
            })}
            <MoreCard label={nextLabel} />
          </ListingGrid>
        ) : (
          <Empty>{t.seller.listingsEmpty}</Empty>
        )}
      </Section>

      {portfolio && (
        <MarketPeekDialog
          classId={portfolio.classId}
          speciesId={portfolio.speciesId}
          onClose={() => setPortfolio(null)}
        />
      )}
    </Root>
  )
}
