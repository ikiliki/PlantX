import { useMemo, useState, type ReactNode } from 'react'
import { GreenhouseLure } from '../../../discover/components/GreenhouseLure/GreenhouseLure'
import { ShortcutRail } from '../../../feed/components/HomeRails/HomeRails'
import { TopGreenhouses } from '../../../feed/components/TopGreenhouses/TopGreenhouses'
import { AddPlantCard } from '../../../greenhouse/components/GreenhousePlantCard/GreenhousePlantCard'
import { ListingMap } from '../../../market/components/ListingMap/ListingMap'
import { ListingTable } from '../../../market/components/ListingTable/ListingTable'
import { MarketSearch } from '../../../market/components/MarketSearch/MarketSearch'
import { MarketTicker } from '../../../market/components/MarketTicker/MarketTicker'
import { listingFilterMeta } from '../../../market/listingFilterMeta'
import { emptyMarketFilters, type MarketFilterState } from '../../../market/marketFilters'
import { useI18n } from '../../../../i18n/I18nProvider'
import { userPlace } from '../../../../mock/locations'
import { useStore } from '../../../../mock/store'
import type { PlainId } from '../../../../theme/release'
import { Frame, Stage } from './PlacementPreview.styles'

function SearchPreview() {
  const { db, currentUser } = useStore()
  const { locale } = useI18n()
  const [filters, setFilters] = useState<MarketFilterState>(() => emptyMarketFilters())
  const origin = userPlace(currentUser)
  const meta = useMemo(
    () =>
      listingFilterMeta({
        listings: db.listings,
        plants: db.plants,
        species: db.species,
        marketClasses: db.marketClasses,
        catalog: db.catalog,
        filters,
        origin,
        locale,
      }),
    [db, filters, origin, locale],
  )
  return <MarketSearch filters={filters} onChange={setFilters} meta={meta} />
}

function ListingsPreview() {
  const { db } = useStore()
  const listings = db.listings.filter((listing) => listing.status === 'active').slice(0, 6)
  return <ListingTable listings={listings} onOpen={() => {}} />
}

function MapPreview() {
  const { db } = useStore()
  const listings = db.listings.filter((listing) => listing.status === 'active').slice(0, 12)
  return <ListingMap listings={listings} />
}

function previewFor(id: PlainId): ReactNode {
  switch (id) {
    case 'home.lure':
      return <GreenhouseLure />
    case 'home.shortcuts':
      return <ShortcutRail />
    case 'home.top':
      return <TopGreenhouses />
    case 'market.ticker':
      return <MarketTicker />
    case 'market.search':
      return <SearchPreview />
    case 'market.listings':
      return <ListingsPreview />
    case 'market.map':
      return <MapPreview />
    case 'greenhouse.add':
      return <AddPlantCard onClick={() => {}} />
    default: {
      const unreachable: never = id
      return unreachable
    }
  }
}

/** Live render of a piece that has no release flag. */
export function PlainPreview({ id }: { id: PlainId }) {
  return (
    <Frame inert>
      <Stage>{previewFor(id)}</Stage>
    </Frame>
  )
}
