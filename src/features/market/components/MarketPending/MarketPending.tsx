import { useMemo } from 'react'
import { Icon } from '../../../../components/Icon/Icon'
import { useI18n } from '../../../../i18n/I18nProvider'
import { userPlace } from '../../../../mock/locations'
import { useStore } from '../../../../mock/store'
import type { Listing } from '../../../../mock/types'
import type { ComponentView } from '../../../../theme/view'
import { listingFilterMeta } from '../../listingFilterMeta'
import { emptyMarketFilters } from '../../marketFilters'
import { useOpenMarketListing } from '../../useOpenMarketListing'
import { ListingMap } from '../ListingMap/ListingMap'
import { ListingTable } from '../ListingTable/ListingTable'
import { MarketSearch } from '../MarketSearch/MarketSearch'
import { MarketViewToggle } from '../MarketViewToggle/MarketViewToggle'
import { TickerStrip } from '../MarketTicker/TickerStrip'
import {
  ChartsLink,
  Copy,
  DataBlur,
  FilterBlur,
  Head,
  MapSlot,
  Root,
  SoonBanner,
  Split,
  Sub,
  Veil,
  Widget,
} from './MarketPending.styles'

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

  return (
    <Root>
      <Head>
        <Copy>
          <h1>{t.exchange.title}</h1>
          <Sub>{t.exchange.subtitle}</Sub>
        </Copy>
        <ChartsLink to="/market/categories">
          <Icon name="chart" size={18} />
          {t.nav.charts}
        </ChartsLink>
      </Head>

      <Veil>
        <DataBlur aria-hidden="true">
          <TickerStrip variant="bar" prices="masked" />
        </DataBlur>
        <SoonBanner>
          <span>{banner}</span>
        </SoonBanner>
      </Veil>

      <FilterBlur inert aria-hidden="true">
        <MarketSearch
          filters={filters}
          onChange={() => {}}
          meta={meta}
          end={<MarketViewToggle view="map" onChange={() => {}} />}
        />
      </FilterBlur>

      <Split>
        <Veil>
          <ListingTable listings={listings} masked onOpen={openListing} />
          <SoonBanner>
            <span>{banner}</span>
          </SoonBanner>
        </Veil>
        <MapSlot>
          <ListingMap listings={listings} tall masked />
        </MapSlot>
      </Split>
    </Root>
  )
}
