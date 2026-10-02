import { useMemo, useState } from 'react'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { MockDb } from '../../../../mock/types'
import type { Listing, Plant } from '../../../../mock/types'
import { maskedChange, maskedPrice, maskedQty } from '../../maskedQuote'
import { ListingRow } from '../ListingRow/ListingRow'
import { HeadCell, Header, Scroll, Sheet } from './ListingTable.styles'
import { toListingRow, type ListingRowModel } from './listingRows'

type SortKey = 'name' | 'health' | 'size' | 'stage' | 'area' | 'qty' | 'price' | 'change'

const textKeys: SortKey[] = ['name', 'area', 'stage', 'health', 'size']

function compare(a: ListingRowModel, b: ListingRowModel, key: SortKey, dir: 1 | -1, locale: string) {
  const sign = dir
  if (key === 'name' || key === 'area') {
    const left = key === 'name' ? a.name : a.area
    const right = key === 'name' ? b.name : b.area
    return left.localeCompare(right, locale) * sign
  }
  if (key === 'health') return (a.healthRank - b.healthRank) * sign
  if (key === 'size') return (a.sizeRank - b.sizeRank) * sign
  if (key === 'stage') return (a.stageRank - b.stageRank) * sign
  if (key === 'qty') return (a.qty - b.qty) * sign
  if (key === 'price') return (a.price - b.price) * sign
  return ((a.change ?? -999) - (b.change ?? -999)) * sign
}

function Caret({ down }: { down: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden style={{ transform: down ? 'rotate(180deg)' : undefined }}>
      <path d="M2 6.5 5 3.5 8 6.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ListingTable({
  listings,
  onOpen,
  selectedId,
  sortKey: controlledKey,
  sortDir: controlledDir,
  onSortChange,
  masked = false,
  source,
}: {
  listings: Listing[]
  onOpen?: (id: string) => void
  selectedId?: string
  sortKey?: SortKey
  sortDir?: 1 | -1
  onSortChange?: (key: SortKey, dir: 1 | -1) => void
  /** Coming-soon board: stand-in figures, with the row itself blurred by the caller. */
  masked?: boolean
  /** Where listings' plants, classes and species are looked up. Defaults to the store; previews pass sample data. */
  source?: Pick<MockDb, 'plants' | 'marketClasses' | 'species'>
}) {
  const { db: storeDb } = useStore()
  const db = source ?? storeDb
  const { t, formatMoney, locale } = useI18n()
  const [localKey, setLocalKey] = useState<SortKey>('name')
  const [localDir, setLocalDir] = useState<1 | -1>(1)
  const sortKey = controlledKey ?? localKey
  const dir = controlledDir ?? localDir

  const rows = useMemo(() => {
    const stageLabel = (stage: string | undefined, rooting: Plant['rooting']) => {
      if (stage === 'MATURE') return t.market.mature
      if (stage === 'EST') return t.market.established
      if (stage === 'ROOTED') return t.market.rooted
      if (stage === 'CUT') return t.market.unitCutting
      if (rooting === 'rooted') return t.market.rooted
      if (rooting === 'unrooted') return t.market.unrooted
      return t.market.established
    }
    const models = listings.flatMap((listing) => {
      const plant = db.plants.find((item) => item.id === listing.plantId)
      const marketClass = db.marketClasses.find(
        (item) => item.id === listing.marketClassId || item.id === plant?.marketClassId,
      )
      const species = db.species.find((item) => item.id === plant?.speciesId)
      const row = toListingRow(listing, plant, marketClass, locale, formatMoney, stageLabel, species)
      if (!row) return []
      if (!masked) return [row]
      const price = maskedPrice(listing.id)
      const change = maskedChange(listing.id)
      const maskedRow: ListingRowModel = {
        ...row,
        price,
        priceLabel: formatMoney(price),
        change,
        qty: maskedQty(listing.id),
      }
      return [maskedRow]
    })
    const sorted = models.sort((a, b) => compare(a, b, sortKey, dir, locale))
    if (!selectedId) return sorted
    const index = sorted.findIndex((row) => row.id === selectedId)
    if (index <= 0) return sorted
    const next = sorted.slice()
    const [pinned] = next.splice(index, 1)
    next.unshift(pinned)
    return next
  }, [listings, db.plants, db.marketClasses, db.species, locale, formatMoney, sortKey, dir, t, selectedId, masked])

  const sortBy = (key: SortKey) => {
    if (key === sortKey) {
      const nextDir = dir === 1 ? -1 : 1
      if (onSortChange) onSortChange(key, nextDir)
      else setLocalDir(nextDir)
      return
    }
    const nextDir = textKeys.includes(key) ? 1 : -1
    if (onSortChange) onSortChange(key, nextDir)
    else {
      setLocalKey(key)
      setLocalDir(nextDir)
    }
  }

  const columns: { key: SortKey; label: string }[] = [
    { key: 'name', label: t.market.filterCategories },
    { key: 'health', label: t.market.filterGrade },
    { key: 'size', label: t.market.size },
    { key: 'stage', label: t.market.stage },
    { key: 'area', label: t.market.filterArea },
    { key: 'qty', label: t.market.quantity },
    { key: 'price', label: t.market.price },
    { key: 'change', label: t.market.change },
  ]

  return (
    <Scroll>
      <Sheet>
        <Header $inert={masked}>
          <span />
          {columns.map((column) => (
            <HeadCell
              key={column.key}
              type="button"
              $on={sortKey === column.key}
              aria-sort={sortKey === column.key ? (dir === 1 ? 'ascending' : 'descending') : 'none'}
              onClick={() => sortBy(column.key)}
            >
              <span>{column.label}</span>
              <Caret down={sortKey === column.key && dir === -1} />
            </HeadCell>
          ))}
        </Header>
        {rows.map((row) => (
          <ListingRow key={row.id} row={row} selected={row.id === selectedId} onOpen={onOpen} masked={masked} />
        ))}
      </Sheet>
    </Scroll>
  )
}
