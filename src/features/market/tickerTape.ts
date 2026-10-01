import type { Listing, MarketClass, Plant } from '../../mock/types'

/** Quiet placeholders when the market has no listings and no class prices. */
export const TICKER_EMPTY_SLOTS = 3
/** How many quote chips can sit in the running strip at once. */
export const TICKER_VISIBLE_CAP = 6
/** Pool the marquee draws from. */
export const TICKER_STOCK_CAP = 12

export type TickerQuote = {
  id: string
  code: string
  price: number
  changePct: number | null
  href: string
  photo?: string
  classId?: string
  speciesId?: string
}

export type TickerSlot =
  | { kind: 'empty'; key: string }
  | { kind: 'quote'; key: string; quote: TickerQuote }

type TapeDb = {
  marketClasses: MarketClass[]
  listings: Listing[]
  plants: Plant[]
}

function fromClass(marketClass: MarketClass): TickerQuote {
  return {
    id: marketClass.id,
    code: marketClass.code,
    price: marketClass.lastPrice,
    changePct: marketClass.changePct,
    href: `/market/${marketClass.id}`,
    photo: marketClass.photo,
    classId: marketClass.id,
    speciesId: marketClass.speciesId,
  }
}

function fromListing(listing: Listing, plant: Plant): TickerQuote {
  return {
    id: listing.id,
    code: plant.code,
    price: listing.price,
    changePct: null,
    href: plant.marketClassId ? `/market/${plant.marketClassId}` : `/plants/${plant.id}`,
    photo: plant.photos[0],
    classId: plant.marketClassId,
    speciesId: plant.speciesId,
  }
}

/** One quote per future slot. Classes first; listings only when there is no class tape. */
export function buildTickerStock(db: TapeDb): TickerQuote[] {
  if (db.marketClasses.length > 0) {
    return db.marketClasses.slice(0, TICKER_STOCK_CAP).map(fromClass)
  }

  const quotes: TickerQuote[] = []
  for (const listing of db.listings) {
    if (quotes.length >= TICKER_STOCK_CAP) break
    if (listing.status !== 'active') continue
    const plant = db.plants.find((item) => item.id === listing.plantId)
    if (!plant) continue
    quotes.push(fromListing(listing, plant))
  }
  return quotes
}

export function emptyTickerSlots(): TickerSlot[] {
  return Array.from({ length: TICKER_EMPTY_SLOTS }, (_, index) => ({
    kind: 'empty' as const,
    key: `empty-${index}`,
  }))
}

/**
 * The strip never holds more than the visible cap; a longer stock is a
 * window advanced by `cursor`.
 */
export function slotsFor(stock: TickerQuote[], cursor: number): TickerSlot[] {
  if (stock.length === 0) return emptyTickerSlots()

  const count = Math.min(stock.length, TICKER_VISIBLE_CAP)
  return Array.from({ length: count }, (_, index) => {
    const quote = stock[(cursor + index) % stock.length]
    return { kind: 'quote' as const, key: `slot-${index}`, quote }
  })
}
