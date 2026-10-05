import { useMemo, useState } from 'react'
import { useI18n } from '../../../../i18n/I18nProvider'
import { userPlace } from '../../../../mock/locations'
import { useStore } from '../../../../mock/store'
import type { Listing } from '../../../../mock/types'
import type { ComponentView } from '../../../../theme/view'
import { createSeed } from '../../../../mock/seed'
import { listingFilterMeta } from '../../listingFilterMeta'
import { emptyMarketFilters } from '../../marketFilters'
import { useOpenMarketListing } from '../../useOpenMarketListing'
import { ListingMap } from '../ListingMap/ListingMap'
import { ListingTable } from '../ListingTable/ListingTable'
import { MarketSearch } from '../MarketSearch/MarketSearch'
import { MarketSplit } from '../MarketSplit/MarketSplit'
import { MarketViewToggle } from '../MarketViewToggle/MarketViewToggle'
import { TickerStrip } from '../MarketTicker/TickerStrip'
import { DataBlur, Root, SoonBanner, SoonPill, Widget } from './MarketPending.styles'

function previewListings(listings: Listing[], limit: number) {
  return listings.filter((item) => item.status === 'active').slice(0, limit)
}

/** The live market chrome, with stand-in listings blurred until the market opens. */
export function MarketPending({ view = 'page' }: { view?: ComponentView }) {
  const { db, currentUser } = useStore()
  const { t, locale } = useI18n()
  const openListing = useOpenMarketListing()
  const status = db.system.features.market.status
  const banner = status === 'maintenance' ? t.release.maintenance : t.release.comingSoon
  const listings = previewListings(db.listings, view === 'widget' ? 3 : 6)
  const filters = emptyMarketFilters()
  const [paneView, setPaneView] = useState<'list' | 'map'>('list')
  // Sample market from the demo seed, built once, only used while the market has no real listings.
  const sample = useMemo(() => {
    const seed = createSeed()
    return { listings: previewListings(seed.listings, 8), source: seed }
  }, [])
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
    [db.catalog, db.listings, db.marketClasses, db.plants, db.species, filters, locale, origin],
  )

  if (view === 'widget') {
    return (
      <Widget>
        <DataBlur aria-hidden="true">
          <TickerStrip variant="glance" prices="masked" />
        </DataBlur>
        <ListingTable listings={listings} masked onOpen={openListing} />
        <SoonBanner>
          <span>{banner}</span>
        </SoonBanner>
      </Widget>
    )
  }

  // No real listings yet (QA, a fresh production): sample ones, blurred, under the "sample listings" pill.
  const preview = listings.length > 0 ? { listings, source: undefined } : sample
  return (
    <Root>
      <SoonPill role="status">
        <span aria-hidden>✦</span>
        {banner} · {t.release.sampleData}
      </SoonPill>

      {/* Filters show what is coming but do nothing yet; the list / map switch at the end works. */}
      <MarketSearch
        filters={filters}
        onChange={() => {}}
        meta={meta}
        inactive
        end={<MarketViewToggle view={paneView} onChange={setPaneView} />}
      />

      {/* Sample rows and map prices are a picture of the market, not listings: hidden from screen readers and inert (#17). */}
      <div inert aria-hidden="true">
        <MarketSplit
          view={paneView}
          list={<ListingTable listings={preview.listings} masked source={preview.source} />}
          map={() => <ListingMap listings={preview.listings} tall masked source={preview.source} />}
        />
      </div>
    </Root>
  )
}
