import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../../app/AppShell/AppShell.styles'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { FeatureGate } from '../../components/FeatureGate/FeatureGate'
import { ListingMap } from '../../features/market/components/ListingMap/ListingMap'
import { ListingTable } from '../../features/market/components/ListingTable/ListingTable'
import { MarketSearch } from '../../features/market/components/MarketSearch/MarketSearch'
import { MarketViewToggle } from '../../features/market/components/MarketViewToggle/MarketViewToggle'
import { MarketTicker } from '../../features/market/components/MarketTicker/MarketTicker'
import { listingFilterMeta } from '../../features/market/listingFilterMeta'
import { resolveMarketFocus } from '../../features/market/marketFocus'
import { emptyMarketFilters, type MarketFilterState } from '../../features/market/marketFilters'
import { useFilteredMarketListings } from '../../features/market/useFilteredMarketListings'
import { useOpenMarketListing } from '../../features/market/useOpenMarketListing'
import { useI18n } from '../../i18n/I18nProvider'
import { userPlace } from '../../mock/locations'
import { useStore } from '../../mock/store'
import { useServerSlices } from '../../mock/useServerSlices'
import { PageGate } from '../../components/PageGate/PageGate'
import type { ComponentView } from '../../theme/view'
import { MarketPending } from '../../features/market/components/MarketPending/MarketPending'
import { Icon } from '../../components/Icon/Icon'
import { BlurTape, CategoriesLink, Board, MapPane, Pager, PagerButton, Results, ResultsHead, Stage } from './MarketPage.styles'

const MARKET_PAGE_SIZE = 5
const WIDGET_LISTINGS = 4

function MarketReady({ view }: { view: ComponentView }) {
  const { db, currentUser } = useStore()
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const seenArrival = useRef('')
  const [filters, setFilters] = useState<MarketFilterState>(() => emptyMarketFilters(params.get('species') ?? ''))
  const [showMap, setShowMap] = useState(true)
  const origin = userPlace(currentUser)
  const paging = db.flags.market === 'pages'
  const [page, setPage] = useState(0)
  useEffect(() => {
    const itemId = params.get('item')
    const classId = params.get('class')
    const key = `${itemId ?? ''}|${classId ?? ''}`
    if (key === '|' || seenArrival.current === key) return
    seenArrival.current = key
    const focus = resolveMarketFocus(db, itemId, classId)
    if (focus?.classId) {
      navigate(`/market/${focus.classId}`, { replace: true })
      return
    }
    if (focus?.query) setFilters((current) => ({ ...current, query: focus.query }))
  }, [params, db, navigate])

  const listings = useFilteredMarketListings(filters)
  const openListing = useOpenMarketListing()

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
    [db.listings, db.plants, db.species, db.marketClasses, db.catalog, filters, origin, locale],
  )

  const listingKey = listings.map((listing) => listing.id).join('|')
  useEffect(() => {
    setPage(0)
  }, [paging, listingKey])

  const pageCount = Math.max(1, Math.ceil(listings.length / MARKET_PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const shown = paging ? listings.slice(safePage * MARKET_PAGE_SIZE, safePage * MARKET_PAGE_SIZE + MARKET_PAGE_SIZE) : listings
  const visible = view === 'widget' ? shown.slice(0, WIDGET_LISTINGS) : shown
  const rangeFrom = listings.length === 0 ? 0 : safePage * MARKET_PAGE_SIZE + 1
  const rangeTo = safePage * MARKET_PAGE_SIZE + shown.length

  if (view === 'widget') {
    return (
      <Board>
        <BlurTape>
          <MarketTicker />
        </BlurTape>
        {visible.length === 0 ? (
          <EmptyState title={t.market.empty} />
        ) : (
          <ListingTable listings={visible} onOpen={openListing} />
        )}
      </Board>
    )
  }

  return (
    <Board>
      <PageHeader>
        <div>
          <h1>{t.exchange.title}</h1>
          <p>{t.exchange.subtitle}</p>
        </div>
        <CategoriesLink to="/market/categories">
          <Icon name="chart" size={18} />
          {t.nav.charts}
        </CategoriesLink>
      </PageHeader>

      <MarketTicker />

      <MarketSearch
        filters={filters}
        onChange={setFilters}
        meta={meta}
        end={<MarketViewToggle view={showMap ? 'map' : 'list'} onChange={(next) => setShowMap(next === 'map')} />}
      />

      <Stage>
        <Results>
          <ResultsHead>
            <span>
              {listings.length} {t.market.listings}
            </span>
            {paging && listings.length > 0 && (
              <Pager>
                <PagerButton type="button" disabled={safePage === 0} onClick={() => setPage((current) => current - 1)}>
                  {t.demo.previous}
                </PagerButton>
                <span>
                  {rangeFrom}–{rangeTo} {t.common.of} {listings.length}
                </span>
                <PagerButton
                  type="button"
                  disabled={safePage >= pageCount - 1}
                  onClick={() => setPage((current) => current + 1)}
                >
                  {t.demo.next}
                </PagerButton>
              </Pager>
            )}
          </ResultsHead>
          {shown.length === 0 ? (
            <EmptyState title={t.market.empty} />
          ) : (
            <ListingTable listings={shown} onOpen={openListing} />
          )}
        </Results>
        <MapPane $open={showMap}>{showMap ? <ListingMap listings={shown} tall /> : null}</MapPane>
      </Stage>
    </Board>
  )
}

export function MarketPage({ view = 'page' }: { view?: ComponentView }) {
  const { t } = useI18n()
  useServerSlices(['users', 'plants', 'catalog'])

  return (
    <PageGate pageId="market" title={t.nav.market}>
      <FeatureGate placement="market.board" title={t.nav.market} pending={<MarketPending view={view} />}>
        <MarketReady view={view} />
      </FeatureGate>
    </PageGate>
  )
}
