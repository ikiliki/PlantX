import { useMemo } from 'react'
import { ListingTable } from '../../../market/components/ListingTable/ListingTable'
import { useOpenMarketListing } from '../../../market/useOpenMarketListing'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { Plant } from '../../../../mock/types'
import { isPageNavigable, isPlacementEnabled } from '../../../../theme/release'
import { Empty, Root } from './PassportMarket.styles'

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
