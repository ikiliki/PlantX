import { HEALTH_RANK } from '../../../../mock/catalog'
import type { Listing, MarketClass, Plant, Species } from '../../../../mock/types'
import { isPhotoStale } from '../../../greenhouse/plantCare'

export type ListingRowModel = {
  id: string
  href: string
  photo?: string
  name: string
  health: string
  size: string
  stage: string
  area: string
  qty: number
  price: number
  priceLabel: string
  change: number | null
  classId?: string
  speciesId?: string
  healthRank: number
  sizeRank: number
  stageRank: number
  photoStale: boolean
}

const sizeRank: Record<string, number> = { S: 0, M: 1, L: 2, XL: 3 }
const stageRank: Record<string, number> = { CUT: 0, ROOTED: 1, EST: 2, MATURE: 3 }
const rootingRank: Record<string, number> = { unrooted: 0, rooted: 1, established: 2 }

export function toListingRow(
  listing: Listing,
  plant: Plant | undefined,
  marketClass: MarketClass | undefined,
  locale: 'he' | 'en',
  formatMoney: (n: number) => string,
  stageLabel: (stage: string | undefined, rooting: Plant['rooting']) => string,
  species?: Species,
): ListingRowModel | null {
  if (!plant) return null
  const fullName = marketClass
    ? locale === 'he'
      ? marketClass.displayNameHe
      : marketClass.displayName
    : locale === 'he'
      ? plant.titleHe
      : plant.title
  const name = fullName.split(' · ')[0] || fullName
  const health = marketClass?.quality ?? plant.quality
  const size = marketClass?.size ?? plant.sizeBand ?? '—'
  const stage = stageLabel(marketClass?.stage, plant.rooting)
  const price = marketClass?.lastPrice ?? listing.price

  return {
    id: listing.id,
    href: marketClass ? `/market/${marketClass.id}` : `/plants/${plant.id}`,
    photo: plant.photos[0],
    name,
    health,
    size,
    stage,
    area: locale === 'he' ? listing.regionHe : listing.region,
    qty: listing.quantity,
    price,
    priceLabel: formatMoney(price),
    change: marketClass ? marketClass.changePct : null,
    classId: marketClass?.id,
    speciesId: plant.speciesId,
    healthRank: health ? (HEALTH_RANK[health] ?? 9) : 9,
    sizeRank: size === '—' ? 9 : (sizeRank[size] ?? 9),
    stageRank: marketClass ? (stageRank[marketClass.stage] ?? 9) : (rootingRank[plant.rooting] ?? 9),
    photoStale: isPhotoStale(plant),
  }
}
