import { useMemo } from 'react'
import { ListingTable } from '../../../market/components/ListingTable/ListingTable'
import { DataBlur, SoonBanner, Veil } from '../../../market/components/MarketPending/MarketPending.styles'
import { StockChart } from '../../../market/components/StockChart/StockChart'
import type { PricePoint } from '../../../../mock/marketHistory'
import { useOpenMarketListing } from '../../../market/useOpenMarketListing'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { Plant } from '../../../../mock/types'
import { isPageNavigable, isPlacementEnabled } from '../../../../theme/release'
import { Empty, Root } from './PassportMarket.styles'

/**
 * Stand-in price history while the market is closed: a seeded walk, so the same plant always
 * draws the same blurred line. Never shown as real data — it sits under the "coming soon" tape.
 */
function previewPoints(seed: string): PricePoint[] {
  let state = [...seed].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7)
  const next = () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 2 ** 32
  }
  const start = Date.UTC(2026, 0, 1)
  let price = 40 + next() * 60
  return Array.from({ length: 120 }, (_, day) => {
    price = Math.max(12, price * (1 + (next() - 0.47) * 0.06))
    return { t: new Date(start + day * 86_400_000).toISOString().slice(0, 10), price: Math.round(price), volume: Math.round(2 + next() * 9) }
  })
}

/** Live class listings for a passport, using the same table as the market board. */
export function PassportMarket({
  plant,
  selectedListingId,
  masked = false,
}: {
  plant: Plant
  selectedListingId?: string
  masked?: boolean
}) {
  const { db } = useStore()
  const { t } = useI18n()
  const openListing = useOpenMarketListing()
  const marketOpen =
    isPageNavigable(db.system, 'market') && isPlacementEnabled(db.system, 'market.board') && !masked

  const listings = useMemo(() => {
    const classId = plant.marketClassId
    return db.listings.filter((item) => {
      if (item.status !== 'active' && item.status !== 'reserved') return false
      if (classId) return item.marketClassId === classId || item.plantId === plant.id
      return item.plantId === plant.id
    })
  }, [db.listings, plant.id, plant.marketClassId])

  // Market not open yet: a blurred price chart under the "coming soon" tape, then any masked listings.
  if (masked) {
    return (
      <Root>
        <Veil>
          <DataBlur aria-hidden="true">
            <StockChart points={previewPoints(plant.marketClassId ?? plant.id)} height={220} />
          </DataBlur>
          <SoonBanner>
            <span>{t.release.comingSoon}</span>
          </SoonBanner>
        </Veil>
        {listings.length > 0 ? <ListingTable listings={listings} masked /> : null}
      </Root>
    )
  }

  if (listings.length === 0) {
    return (
      <Root>
        <Empty>{t.passport.marketEmpty}</Empty>
      </Root>
    )
  }

  return (
    <Root>
      <ListingTable
        listings={listings}
        selectedId={selectedListingId}
        onOpen={marketOpen ? openListing : undefined}
        masked={masked}
      />
    </Root>
  )
}
