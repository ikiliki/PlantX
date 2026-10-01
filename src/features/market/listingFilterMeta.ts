import { MARKET_AREAS } from '../../mock/locations'
import type {
  Catalog,
  Listing,
  Locale,
  MarketClass,
  Plant,
  QualityGrade,
  SizeBand,
  Species,
  StageBand,
} from '../../mock/types'
import {
  catalogName,
  categoryBySpeciesId,
  optionLabel,
  propertyRelevant,
  requiredProperties,
} from '../catalog/catalog'
import { buildOthersFilterGroups, type OthersFilterGroup } from '../catalog/othersFilterGroups'
import { listingMatches, PRICE_BANDS, type MarketFilterState, type PriceBandId } from './marketFilters'

export type FilterOption<T extends string = string> = {
  id: T
  count: number
}

export type NamedOption<T extends string = string> = FilterOption<T> & {
  name: string
}

export type PropertyFilterMeta = {
  id: string
  name: string
  required: boolean
  relevant: boolean
  options: NamedOption[]
}

export type { OthersFilterGroup }

export type ListingFilterMeta = {
  species: NamedOption[]
  subcategories: NamedOption[]
  grades: FilterOption<QualityGrade>[]
  sizes: FilterOption<SizeBand>[]
  stages: NamedOption<StageBand>[]
  required: PropertyFilterMeta[]
  othersGroups: OthersFilterGroup[]
  rooting: FilterOption<Plant['rooting']>[]
  units: FilterOption<Listing['unit']>[]
  areas: NamedOption[]
  priceBands: FilterOption<PriceBandId>[]
  withPhoto: number
  verified: number
  pickupOnly: number
  offers: number
}

const ROOTING: Plant['rooting'][] = ['rooted', 'established', 'unrooted']
const UNITS: Listing['unit'][] = ['plant', 'cutting', 'bundle']

/**
 * Mock of a future metadata request. Options are only the values that already
 * match at least one active listing under the other selected filters.
 */
export function listingFilterMeta(input: {
  listings: Listing[]
  plants: Plant[]
  species: Species[]
  marketClasses: MarketClass[]
  catalog: Catalog
  filters: MarketFilterState
  origin: { lat: number; lng: number } | null
  locale: Locale
}): ListingFilterMeta {
  const { listings, plants, species, marketClasses, catalog, filters, origin, locale } = input
  const active = listings.filter((listing) => listing.status === 'active')
  const selectedCategoryId = categoryBySpeciesId(catalog, filters.speciesId)?.id ?? ''

  const count = (patch: Partial<MarketFilterState>) => {
    const next = { ...filters, ...patch, traits: patch.traits ?? filters.traits }
    return active.filter((listing) => {
      const plant = plants.find((item) => item.id === listing.plantId)
      const marketClass = marketClasses.find(
        (item) => item.id === listing.marketClassId || item.id === plant?.marketClassId,
      )
      return listingMatches(listing, plant, marketClass, next, origin, catalog)
    }).length
  }

  const speciesOptions = species.flatMap((item) => {
    const matches = count({ speciesId: item.id })
    if (matches === 0) return []
    const category = categoryBySpeciesId(catalog, item.id)
    const name = category ? catalogName(category, locale) : locale === 'he' ? item.commonNameHe : item.commonName
    return [{ id: item.id, name, count: matches }]
  })

  const subcategories = catalog.subcategories.flatMap((item) => {
    if (selectedCategoryId && item.categoryId !== selectedCategoryId) return []
    const matches = count({ subcategoryIds: [item.id] })
    if (matches === 0) return []
    return [{ id: item.id, name: catalogName(item, locale), count: matches }]
  })

  const required = requiredProperties(catalog).map((property) => {
    const options = property.options.flatMap((option) => {
      const patch =
        property.id === 'grade'
          ? { grades: [option.id as QualityGrade] }
          : property.id === 'size'
            ? { sizes: [option.id as SizeBand] }
            : property.id === 'stage'
              ? { stages: [option.id as StageBand] }
              : { traits: { ...filters.traits, [property.id]: [option.id] } }
      const matches = count(patch)
      if (matches === 0) return []
      return [{ id: option.id, name: optionLabel(option, locale), count: matches }]
    })
    return {
      id: property.id,
      name: catalogName(property, locale),
      required: true,
      relevant: propertyRelevant(catalog, property, selectedCategoryId, filters.subcategoryIds[0] ?? ''),
      options,
    }
  })

  const gradeMeta = required.find((item) => item.id === 'grade')
  const sizeMeta = required.find((item) => item.id === 'size')
  const stageMeta = required.find((item) => item.id === 'stage')

  return {
    species: speciesOptions,
    subcategories,
    grades: (gradeMeta?.options ?? []).map((item) => ({ id: item.id as QualityGrade, count: item.count })),
    sizes: (sizeMeta?.options ?? []).map((item) => ({ id: item.id as SizeBand, count: item.count })),
    stages: (stageMeta?.options ?? []).map((item) => ({
      id: item.id as StageBand,
      name: item.name,
      count: item.count,
    })),
    required,
    othersGroups: buildOthersFilterGroups({
      catalog,
      locale,
      selectedCategoryId,
      subcategoryId: filters.subcategoryIds[0] ?? '',
      filters,
      count,
    }),
    rooting: ROOTING.flatMap((id) => {
      const matches = count({ rooting: [id] })
      return matches === 0 ? [] : [{ id, count: matches }]
    }),
    units: UNITS.flatMap((id) => {
      const matches = count({ units: [id] })
      return matches === 0 ? [] : [{ id, count: matches }]
    }),
    areas: MARKET_AREAS.flatMap((area) => {
      const matches = count({ areaId: area.id })
      if (matches === 0) return []
      return [{ id: area.id, name: locale === 'he' ? area.regionHe : area.region, count: matches }]
    }),
    priceBands: PRICE_BANDS.flatMap((id) => {
      const matches = count({ priceBand: id })
      return matches === 0 ? [] : [{ id, count: matches }]
    }),
    withPhoto: count({ withPhoto: true }),
    verified: count({ verified: true }),
    pickupOnly: count({ pickupOnly: true }),
    offers: count({ offers: true }),
  }
}
