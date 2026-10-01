import { listingPlace, placeMatches } from '../../mock/locations'
import type { Catalog, Listing, MarketClass, Plant, QualityGrade, SizeBand, StageBand } from '../../mock/types'
import { plantPropertyValue, subcategoryOfPlant } from '../catalog/catalog'

export const PRICE_BANDS = ['under-100', '100-500', 'over-500'] as const
export type PriceBandId = (typeof PRICE_BANDS)[number]

export type CustomFilters = {
  withPhoto: boolean
  verified: boolean
  pickupOnly: boolean
  offers: boolean
  rooting: Plant['rooting'][]
  units: Listing['unit'][]
  traits: Record<string, string[]>
}

export type MarketFilterState = CustomFilters & {
  query: string
  speciesId: string
  subcategoryIds: string[]
  grades: QualityGrade[]
  sizes: SizeBand[]
  stages: StageBand[]
  areaId: string
  radiusKm: number | null
  priceBand: PriceBandId | ''
}

export const emptyCustomFilters: CustomFilters = {
  withPhoto: false,
  verified: false,
  pickupOnly: false,
  offers: false,
  rooting: [],
  units: [],
  traits: {},
}

export function emptyMarketFilters(speciesId = ''): MarketFilterState {
  return {
    ...emptyCustomFilters,
    query: '',
    speciesId,
    subcategoryIds: [],
    grades: [],
    sizes: [],
    stages: [],
    areaId: '',
    radiusKm: null,
    priceBand: '',
  }
}

export function customFilterCount(filters: CustomFilters) {
  return (
    Number(filters.withPhoto) +
    Number(filters.verified) +
    Number(filters.pickupOnly) +
    Number(filters.offers) +
    filters.rooting.length +
    filters.units.length +
    Object.values(filters.traits).reduce((sum, values) => sum + values.length, 0)
  )
}

/** Active filters excluding free-text search. */
export function marketFilterCount(filters: MarketFilterState) {
  return (
    Number(Boolean(filters.speciesId)) +
    filters.subcategoryIds.length +
    filters.grades.length +
    filters.sizes.length +
    filters.stages.length +
    Number(Boolean(filters.areaId)) +
    Number(filters.radiusKm != null) +
    Number(Boolean(filters.priceBand)) +
    customFilterCount(filters)
  )
}

function priceMatches(price: number, band: MarketFilterState['priceBand']) {
  if (band === 'under-100') return price < 100
  if (band === '100-500') return price >= 100 && price <= 500
  if (band === 'over-500') return price > 500
  return true
}

function traitMatches(plant: Plant, traits: Record<string, string[]>) {
  return Object.entries(traits).every(([propertyId, selected]) => {
    if (selected.length === 0) return true
    const value = plantPropertyValue(plant, propertyId)
    return Boolean(value && selected.includes(value))
  })
}

export function listingMatches(
  listing: Listing,
  plant: Plant | undefined,
  marketClass: MarketClass | undefined,
  filters: MarketFilterState,
  origin: { lat: number; lng: number } | null,
  catalog?: Catalog,
) {
  if (listing.status !== 'active' || !plant) return false
  if (filters.speciesId && plant.speciesId !== filters.speciesId) return false
  if (filters.subcategoryIds.length > 0) {
    const subId = plant.subcategoryId ?? (catalog ? subcategoryOfPlant(catalog, plant)?.id : undefined)
    if (!subId || !filters.subcategoryIds.includes(subId)) return false
  }
  if (filters.grades.length > 0 && (!plant.quality || !filters.grades.includes(plant.quality))) return false
  if (filters.sizes.length > 0 && (!plant.sizeBand || !filters.sizes.includes(plant.sizeBand))) return false
  if (filters.stages.length > 0 && (!plant.stage || !filters.stages.includes(plant.stage))) return false
  if (!priceMatches(listing.price, filters.priceBand)) return false
  if (filters.withPhoto && plant.photos.length === 0) return false
  if (filters.verified && !plant.verifiedAt) return false
  if (filters.pickupOnly && !listing.pickupOnly) return false
  if (filters.offers && !listing.allowOffers) return false
  if (filters.rooting.length > 0 && !filters.rooting.includes(plant.rooting)) return false
  if (filters.units.length > 0 && !filters.units.includes(listing.unit)) return false
  if (!traitMatches(plant, filters.traits)) return false
  if (filters.query) {
    const hay = [
      plant.title,
      plant.titleHe,
      plant.code,
      plant.variety,
      plant.varietyHe,
      marketClass?.code,
      marketClass?.displayName,
      marketClass?.displayNameHe,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    if (!hay.includes(filters.query.trim().toLowerCase())) return false
  }
  return placeMatches(
    listingPlace(listing, plant),
    { areaId: filters.areaId, radiusKm: filters.radiusKm },
    origin,
  )
}
