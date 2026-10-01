import { useState } from 'react'
import { Button } from '../../../../components/Button/Button'
import { ActivityThread, type ActivityEntry } from '../ActivityThread/ActivityThread'
import { AddPlantCard } from '../AddPlantCard/AddPlantCard'
import { CollectionGrid, GreenhousePlantCard } from '../GreenhousePlantCard/GreenhousePlantCard'
import { GreenhouseToday } from '../GreenhouseToday/GreenhouseToday'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { isPhotoStale, isWaterDue } from '../../plantCare'
import type { Plant } from '../../../../mock/types'
import {
  Board,
  Count,
  Empty,
  Filter,
  FilterBar,
  Growing,
  GrowingHead,
  GrowingTitle,
  HeadActions,
  SearchBox,
  Shelf,
} from './CollectionBoard.styles'

export type GreenhouseFilter = 'all' | 'needs' | 'ai' | 'listed' | 'sold'

export function greenhouseFilter(value: string | null): GreenhouseFilter {
  if (value === 'listed' || value === 'sold' || value === 'needs' || value === 'ai') return value
  if (value === 'owned' || value === 'items' || value === 'commitments' || value === 'activity') return 'all'
  return 'all'
}

/** @deprecated Use greenhouseFilter */
export function greenhouseTab(value: string | null): GreenhouseFilter {
  return greenhouseFilter(value)
}

function needsCare(plant: Plant) {
  return isWaterDue(plant) || isPhotoStale(plant)
}

function matchesSearch(plant: Plant, query: string, speciesLabel: string) {
  if (!query) return true
  const haystack = `${plant.title} ${plant.titleHe} ${plant.code} ${speciesLabel}`.toLowerCase()
  return haystack.includes(query)
}

export function CollectionBoard({
  plants,
  sold,
  activity,
  filter: filterProp,
  onFilter,
  onAdd,
  onRefresh,
  onWater,
  compact,
  freshId,
}: {
  plants: Plant[]
  sold: Plant[]
  activity: ActivityEntry[]
  filter?: GreenhouseFilter
  onFilter?: (filter: GreenhouseFilter) => void
  onAdd: () => void
  onRefresh: (plantId: string) => void
  onWater: (plantId: string) => void
  compact?: boolean
  /** The plant just added; its card glows once. */
  freshId?: string
}) {
  const { db } = useStore()
  const { t, locale } = useI18n()
  const [internalFilter, setInternalFilter] = useState<GreenhouseFilter>('all')
  const [query, setQuery] = useState('')
  const filter = filterProp ?? internalFilter
  const setFilter = onFilter ?? setInternalFilter
  const needle = query.trim().toLowerCase()

  const living = plants
  const listed = living.filter((plant) => plant.status === 'listed')
  const needing = living.filter(needsCare)
  const aiVerified = living.filter((plant) => plant.identification?.source === 'ai')

  const pool =
    filter === 'sold'
      ? sold
      : filter === 'listed'
        ? listed
        : filter === 'needs'
          ? needing
          : filter === 'ai'
            ? aiVerified
            : living

  const empty = living.length === 0 && sold.length === 0
  const visible = pool.filter((plant) => {
    const species = db.species.find((item) => item.id === plant.speciesId)
    const speciesLabel = species ? (locale === 'he' ? species.commonNameHe : species.commonName) : ''
    return matchesSearch(plant, needle, speciesLabel)
  })

  const filters: { id: GreenhouseFilter; label: string; count: number }[] = [
    { id: 'all', label: t.greenhouse.filterAll, count: living.length },
    { id: 'needs', label: t.greenhouse.filterNeeds, count: needing.length },
    { id: 'ai', label: `✦ ${t.addPlant.stampVerified}`, count: aiVerified.length },
    { id: 'listed', label: t.greenhouse.filterListed, count: listed.length },
    { id: 'sold', label: t.greenhouse.tabSold, count: sold.length },
  ]

  const shelf = (
    <Growing>
      {!compact && (
        <GreenhouseToday plants={living} onWater={onWater} onRefresh={onRefresh} />
      )}

      <GrowingHead>
        <GrowingTitle>{t.greenhouse.growingNow}</GrowingTitle>
        {!compact && (
          <HeadActions>
            {living.length > 0 ? (
              <SearchBox>
                <img src="/icons/search.svg" alt="" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t.greenhouse.searchPlaceholder}
                  aria-label={t.greenhouse.searchPlaceholder}
                />
              </SearchBox>
            ) : null}
            <Button type="button" variant="growth" onClick={onAdd}>
              + {t.greenhouse.addButton}
            </Button>
          </HeadActions>
        )}
      </GrowingHead>

      {!compact && !empty && (
        <FilterBar role="tablist" aria-label={t.greenhouse.growingNow}>
          {filters.map((item) => (
            <Filter
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              $on={filter === item.id}
              onClick={() => setFilter(item.id)}
            >
              {item.label} <Count>({item.count})</Count>
            </Filter>
          ))}
        </FilterBar>
      )}

      {visible.length === 0 && !empty ? <Empty>{t.greenhouse.filterEmpty}</Empty> : null}
      <CollectionGrid>
        {visible.map((plant) => (
          <GreenhousePlantCard key={plant.id} plant={plant} fresh={plant.id === freshId} />
        ))}
        {filter === 'all' && <AddPlantCard onClick={onAdd} hero={empty} />}
      </CollectionGrid>
    </Growing>
  )

  if (compact) {
    return <Board>{shelf}</Board>
  }

  return (
    <Board $split>
      <Shelf>{shelf}</Shelf>
      <ActivityThread activity={activity} />
    </Board>
  )
}
