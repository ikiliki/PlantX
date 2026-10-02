import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../../app/AppShell/AppShell.styles'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { FeatureGate } from '../../components/FeatureGate/FeatureGate'
import { ListingMap } from '../../features/market/components/ListingMap/ListingMap'
import { ListingTable } from '../../features/market/components/ListingTable/ListingTable'
import { MarketSearch } from '../../features/market/components/MarketSearch/MarketSearch'
import { MarketSplit } from '../../features/market/components/MarketSplit/MarketSplit'
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
import { Pager, usePaged } from '../../components/Pager/Pager'
import { BlurTape, Board, CategoriesLink, ResultsHead } from './MarketPage.styles'

const WIDGET_LISTINGS = 4

function MarketReady({ view }: { view: ComponentView }) {
  const { db, currentUser } = useStore()
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const seenArrival = useRef('')
  const [filters, setFilters] = useState<MarketFilterState>(() => emptyMarketFilters(params.get('species') ?? ''))
  const [paneView, setPaneView] = useState<'list' | 'map'>('list')
  const origin = userPlace(currentUser)
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

  const paged = usePaged(listings, {
    enabled: view === 'page',
    signature: listings.map((listing) => listing.id).join('|'),
  })
  const visible = view === 'widget' ? listings.slice(0, WIDGET_LISTINGS) : paged.shown

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
        end={<MarketViewToggle view={paneView} onChange={setPaneView} />}
      />

      <MarketSplit
        view={paneView}
        list={
          <>
          <ResultsHead>
            <span>
              {listings.length} {t.market.listings}
            </span>
            <Pager
              page={paged.page}
              pageCount={paged.pageCount}
              from={paged.from}
              to={paged.to}
              total={paged.total}
              onPage={paged.setPage}
            />
          </ResultsHead>
          {visible.length === 0 ? (
            <EmptyState title={t.market.empty} />
          ) : (
            <ListingTable listings={visible} onOpen={openListing} />
          )}
          </>
        }
        map={() => <ListingMap listings={visible} tall />}
      />
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
