import type { MarketClass, QualityGrade } from './types'

export type PricePoint = { t: string; price: number; volume: number }

export type TradeParty = { en: string; he: string }

export type MarketTrade = {
  id: string
  classId: string
  code: string
  speciesId: string
  quality: QualityGrade
  at: string
  price: number
  qty: number
  buyer: TradeParty
  seller: TradeParty
}

export const HISTORY_DAYS = 365
export const TRADE_DAYS = 90

const GENERIC_BUYERS: TradeParty[] = [
  { en: 'Collector', he: 'אספן' },
  { en: 'Home grower', he: 'מגדל ביתי' },
  { en: 'Plant shop', he: 'חנות צמחים' },
]
const GENERIC_SELLERS: TradeParty[] = [
  { en: 'Home grower', he: 'מגדל ביתי' },
  { en: 'Nursery', he: 'משתלה' },
]

function hashSeed(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** mulberry32: small deterministic PRNG so every visitor sees the same mock market. */
function seededRandom(seed: string) {
  let a = hashSeed(seed)
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gaussian(rand: () => number) {
  const u = 1 - rand()
  const v = rand()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function roundPrice(price: number) {
  return price >= 100 ? Math.round(price) : Math.round(price * 100) / 100
}

function isoDay(offset: number) {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - offset)
  return d.toISOString().slice(0, 10)
}

const historyCache = new Map<string, PricePoint[]>()

/** Daily closes for the past year. The last two closes honour lastPrice and changePct. */
export function classHistory(mc: MarketClass): PricePoint[] {
  const key = `${mc.code}|${mc.lastPrice}|${mc.changePct}|${mc.supplyUnits}|${isoDay(0)}`
  const cached = historyCache.get(key)
  if (cached) return cached

  const rand = seededRandom(mc.code)
  const sigma = 0.011 + rand() * 0.012
  const yearGain = 0.06 + rand() * 0.28
  const phase = rand() * Math.PI * 2
  const prices = new Array<number>(HISTORY_DAYS + 1)
  prices[HISTORY_DAYS] = mc.lastPrice
  prices[HISTORY_DAYS - 1] = mc.lastPrice / (1 + mc.changePct / 100)
  for (let i = HISTORY_DAYS - 2; i >= 0; i--) {
    const progress = i / HISTORY_DAYS
    const trend = mc.lastPrice * (1 - yearGain * (1 - progress))
    const target = trend * (1 + 0.05 * Math.sin(progress * Math.PI * 2 + phase))
    const pull = Math.log(target / prices[i + 1]) * 0.07
    prices[i] = prices[i + 1] * Math.exp(pull + gaussian(rand) * sigma)
  }

  const baseVolume = Math.max(1, (mc.supplyUnits + mc.bidQty) / 60)
  const points = prices.map((price, i) => {
    const t = isoDay(HISTORY_DAYS - i)
    const day = new Date(`${t}T12:00:00`).getDay()
    const weekend = day === 5 || day === 6
    const volume = Math.round(baseVolume * (0.35 + rand() * 1.3) * (weekend ? 0.45 : 1))
    return { t, price: Math.max(0.5, roundPrice(price)), volume }
  })
  historyCache.set(key, points)
  return points
}

const tradeCache = new Map<string, MarketTrade[]>()

/** Individual fills around each daily close, newest first. */
export function classTrades(mc: MarketClass, days = TRADE_DAYS): MarketTrade[] {
  const history = classHistory(mc)
  const key = `${mc.id}|${days}|${history[history.length - 1].t}|${mc.lastPrice}`
  const cached = tradeCache.get(key)
  if (cached) return cached

  const rand = seededRandom(`${mc.code}:trades`)
  const buyers = [...mc.bids.map((b) => ({ en: b.buyerLabel, he: b.buyerLabelHe })), ...GENERIC_BUYERS]
  const sellers = [...mc.asks.map((a) => ({ en: a.sellerLabel, he: a.sellerLabelHe })), ...GENERIC_SELLERS]
  const maxQty = Math.max(1, Math.round((mc.bidQty + mc.askQty) / 40))
  const trades: MarketTrade[] = []

  history.slice(-days).forEach((point, index) => {
    const busy = Math.min(1, point.volume / Math.max(1, mc.supplyUnits / 45))
    const count = rand() < 0.35 + busy * 0.35 ? 1 + Math.floor(rand() * 2.2) : 0
    for (let n = 0; n < count; n++) {
      trades.push({
        id: `${mc.id}-${point.t}-${n}`,
        classId: mc.id,
        code: mc.code,
        speciesId: mc.speciesId,
        quality: mc.quality,
        at: point.t,
        price: roundPrice(point.price * (1 + (rand() - 0.5) * 0.07)),
        qty: 1 + Math.floor(rand() * rand() * maxQty),
        buyer: buyers[Math.floor(rand() * buyers.length)],
        seller: sellers[Math.floor(rand() * sellers.length)],
      })
    }
    if (index === days - 1 && count === 0) {
      trades.push({
        id: `${mc.id}-${point.t}-last`,
        classId: mc.id,
        code: mc.code,
        speciesId: mc.speciesId,
        quality: mc.quality,
        at: point.t,
        price: mc.lastPrice,
        qty: 1,
        buyer: buyers[0],
        seller: sellers[0],
      })
    }
  })

  const sorted = trades.sort((a, b) => b.at.localeCompare(a.at) || b.price - a.price)
  tradeCache.set(key, sorted)
  return sorted
}

/** Mean daily close across a set of classes, with summed volume. */
export function averageHistory(classes: MarketClass[]): PricePoint[] {
  if (classes.length === 0) return []
  const series = classes.map(classHistory)
  return series[0].map((point, i) => {
    const price = series.reduce((sum, s) => sum + s[i].price, 0) / series.length
    const volume = series.reduce((sum, s) => sum + s[i].volume, 0)
    return { t: point.t, price: roundPrice(price), volume }
  })
}
