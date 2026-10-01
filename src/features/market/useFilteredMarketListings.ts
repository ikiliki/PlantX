import { useMemo } from 'react'
import { userPlace } from '../../mock/locations'
import { useStore } from '../../mock/store'
import type { Listing } from '../../mock/types'
import { listingMatches, type MarketFilterState } from './marketFilters'

export function useFilteredMarketListings(filters: MarketFilterState): Listing[] {
  const { db, currentUser } = useStore()
  const origin = userPlace(currentUser)

  return useMemo(() => {
    return db.listings.filter((listing) => {
      const plant = db.plants.find((item) => item.id === listing.plantId)
      const marketClass = db.marketClasses.find(
        (item) => item.id === listing.marketClassId || item.id === plant?.marketClassId,
      )
      return listingMatches(listing, plant, marketClass, filters, origin, db.catalog)
    })
  }, [db.listings, db.plants, db.marketClasses, db.catalog, filters, origin])
}
