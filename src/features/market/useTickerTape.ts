import { useCallback, useMemo, useState } from 'react'
import type { Listing, MarketBannerScenario, MarketClass, Plant } from '../../mock/types'
import { buildTickerStock, slotsFor, TICKER_VISIBLE_CAP, type TickerQuote, type TickerSlot } from './tickerTape'

const FEW_BANNER_QUOTES = 3

type TapeDb = {
  marketClasses: MarketClass[]
  listings: Listing[]
  plants: Plant[]
}

function quotesForBanner(stock: TickerQuote[], banner: MarketBannerScenario): TickerQuote[] {
  if (banner === 'empty') return []
  if (banner === 'few') return stock.slice(0, FEW_BANNER_QUOTES)
  return stock
}

export function useTickerTape(db: TapeDb, banner: MarketBannerScenario = 'full') {
  const stock = useMemo(
    () => quotesForBanner(buildTickerStock(db), banner),
    [db.marketClasses, db.listings, db.plants, banner],
  )
  const stockKey = stock.map((quote) => quote.id).join('|')
  const [tape, setTape] = useState(() => ({ key: stockKey, cursor: 0 }))

  if (tape.key !== stockKey) {
    setTape({ key: stockKey, cursor: 0 })
  }

  const cursor = tape.key === stockKey ? tape.cursor : 0
  const cycling = stock.length > TICKER_VISIBLE_CAP

  const step = useCallback(() => {
    if (stock.length <= TICKER_VISIBLE_CAP) return
    setTape((current) =>
      current.key === stockKey ? { ...current, cursor: (current.cursor + 1) % stock.length } : current,
    )
  }, [stock.length, stockKey])

  const slots: TickerSlot[] = useMemo(() => slotsFor(stock, cursor), [stock, cursor])

  return {
    stock,
    slots,
    cursor,
    run: !cycling && stock.length > 1,
    cycling,
    step,
  }
}

export function incomingQuote(stock: TickerQuote[], cursor: number, visible: number) {
  if (stock.length <= visible) return undefined
  return stock[(cursor + visible) % stock.length]
}
