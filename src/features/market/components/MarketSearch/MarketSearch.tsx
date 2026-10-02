import { useRef, useState, type ReactNode } from 'react'
import { useI18n } from '../../../../i18n/I18nProvider'
import { CatalogFilterPills } from '../../../catalog/components/CatalogFilterPills/CatalogFilterPills'
import type { ListingFilterMeta } from '../../listingFilterMeta'
import { customFilterCount, type MarketFilterState } from '../../marketFilters'
import { MarketFiltersDialog } from '../MarketFiltersDialog/MarketFiltersDialog'
import { Bar, End, Pill, SearchBox, Pills } from './MarketSearch.styles'

function SlidersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <path
        d="M2.5 4h11M4.5 8h7M6.5 12h3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function MarketSearch({
  filters,
  onChange,
  meta,
  end,
  inactive = false,
}: {
  filters: MarketFilterState
  onChange: (next: MarketFilterState) => void
  meta: ListingFilterMeta
  end?: ReactNode
  /** Coming soon: search and pills show but do nothing; the end slot (list / map toggle) still works. */
  inactive?: boolean
}) {
  const { t } = useI18n()
  const barRef = useRef<HTMLDivElement>(null)
  const [moreOpen, setMoreOpen] = useState(false)
  const customCount = customFilterCount(filters)

  const patch = (partial: Partial<MarketFilterState>) => onChange({ ...filters, ...partial })

  const applyCustom = (next: MarketFilterState) => {
    onChange({
      ...filters,
      withPhoto: next.withPhoto,
      verified: next.verified,
      pickupOnly: next.pickupOnly,
      offers: next.offers,
      rooting: next.rooting,
      units: next.units,
      traits: { ...filters.traits, ...next.traits },
    })
    setMoreOpen(false)
  }

  return (
    <>
      <Bar ref={barRef}>
        <SearchBox inert={inactive} data-inactive={inactive || undefined}>
          <img src="/icons/search.svg" alt="" />
          <input
            value={filters.query}
            placeholder={t.market.searchPlaceholder}
            onChange={(event) => patch({ query: event.target.value })}
            aria-label={t.market.filterSearch}
          />
        </SearchBox>

        <Pills inert={inactive} data-inactive={inactive || undefined}>
        <Pill
          type="button"
          $on={customCount > 0}
          onClick={() => setMoreOpen(true)}
        >
          <SlidersIcon />
          <span>{customCount > 0 ? `${customCount} ${t.market.filtersCount}` : t.market.moreFilters}</span>
        </Pill>

        <CatalogFilterPills
          inline
          containerRef={barRef}
          filters={filters}
          meta={meta}
          onChange={onChange}
          showLocation
        />
        </Pills>

        {end ? <End>{end}</End> : null}
      </Bar>

      {moreOpen && (
        <MarketFiltersDialog
          listingOnly
          value={filters}
          meta={meta}
          onApply={applyCustom}
          onClose={() => setMoreOpen(false)}
        />
      )}
    </>
  )
}
