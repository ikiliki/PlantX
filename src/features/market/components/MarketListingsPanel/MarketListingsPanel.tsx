import { EmptyState } from '../../../../components/EmptyState/EmptyState'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { MarketFilterState } from '../../marketFilters'
import { useFilteredMarketListings } from '../../useFilteredMarketListings'
import { useOpenMarketListing } from '../../useOpenMarketListing'
import { ListingTable } from '../ListingTable/ListingTable'
import { Root, TableWrap, Title } from './MarketListingsPanel.styles'

export function MarketListingsPanel({
  filters,
  title,
  embedded = false,
  selectedId,
  onOpen,
}: {
  /** Pinned filter state (search bar not shown). */
  filters: MarketFilterState
  title?: string
  embedded?: boolean
  selectedId?: string
  onOpen?: (listingId: string) => void
}) {
  const { t } = useI18n()
  const listings = useFilteredMarketListings(filters)
  const openDefault = useOpenMarketListing()
  const open = onOpen ?? openDefault

  return (
    <Root $embedded={embedded} aria-label={title ?? t.market.listings}>
      {title ? <Title>{title}</Title> : null}
      {listings.length === 0 ? (
        <EmptyState title={t.market.empty} />
      ) : (
        <TableWrap $embedded={embedded}>
          <ListingTable listings={listings} selectedId={selectedId} onOpen={open} />
        </TableWrap>
      )}
    </Root>
  )
}
