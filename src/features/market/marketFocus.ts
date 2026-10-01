import type { Listing, MarketClass, Plant } from '../../mock/types'

type FocusDb = {
  listings: Listing[]
  plants: Plant[]
  marketClasses: MarketClass[]
}

export type MarketFocus = {
  listingId: string | null
  classId: string | null
  query: string
}

function classFor(db: FocusDb, listing: Listing | undefined, classId: string | null) {
  const plant = listing ? db.plants.find((item) => item.id === listing.plantId) : undefined
  return db.marketClasses.find(
    (item) => item.id === classId || item.id === listing?.marketClassId || item.id === plant?.marketClassId,
  )
}

export function resolveMarketFocus(db: FocusDb, itemId: string | null, classId: string | null): MarketFocus | null {
  if (!itemId && !classId) return null

  const listing = itemId
    ? db.listings.find((row) => row.id === itemId)
    : db.listings.find((row) => {
        if (row.status !== 'active') return false
        const plant = db.plants.find((item) => item.id === row.plantId)
        return row.marketClassId === classId || plant?.marketClassId === classId
      })

  const marketClass = classFor(db, listing, classId)
  if (!listing && !marketClass) return null

  return {
    listingId: listing?.id ?? null,
    classId: marketClass?.id ?? null,
    query: marketClass?.code ?? '',
  }
}
