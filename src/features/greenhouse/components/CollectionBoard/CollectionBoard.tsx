import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { InfiniteSentinel, useInfiniteList } from '../../../../components/InfiniteScroll/InfiniteScroll'
import { ActivityThread, type ActivityEntry } from '../ActivityThread/ActivityThread'
import { AddPlantCard } from '../AddPlantCard/AddPlantCard'
import { CollectionGrid, GreenhousePlantCard } from '../GreenhousePlantCard/GreenhousePlantCard'
import { TodoCareDialog } from '../../../todo/components/TodoCareDialog/TodoCareDialog'
import { TodoKindIcon } from '../../../todo/components/TodoKindIcon/TodoKindIcon'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { isFeatureEnabled, isPlacementReady } from '../../../../theme/release'
import { needsCare } from '../../plantCare'
import {
  plantHasPhotoDue,
  plantHasUpcoming,
  plantHasUpcomingPhoto,
  plantHasUpcomingWater,
  plantHasWaterDue,
} from '../../../todo/todoSchedule'
import type { Plant, Todo } from '../../../../mock/types'
import {
  Board,
  CareGrid,
  CareSection,
  CareSectionHead,
  CareSections,
  Count,
  Empty,
  Filter,
  FilterBar,
  Growing,
  Rail,
  Shelf,
  Toolbar,
} from './CollectionBoard.styles'

export type GreenhouseFilter = 'all' | 'needs' | 'upcoming' | 'ai' | 'listed' | 'sold'

/** Two rows × four columns for each care category strip. */
const CARE_PAGE = 8

export function greenhouseFilter(value: string | null): GreenhouseFilter {
  if (value === 'listed' || value === 'sold' || value === 'needs' || value === 'upcoming' || value === 'ai') return value
  if (value === 'owned' || value === 'items' || value === 'commitments' || value === 'activity') return 'all'
  return 'all'
}

/** @deprecated Use greenhouseFilter */
export function greenhouseTab(value: string | null): GreenhouseFilter {
  return greenhouseFilter(value)
}

export function CollectionBoard({
  plants,
  sold,
  activity,
  filter: filterProp,
  onFilter,
  onAdd,
  compact,
  freshId,
}: {
  plants: Plant[]
  sold: Plant[]
  activity: ActivityEntry[]
  filter?: GreenhouseFilter
  onFilter?: (filter: GreenhouseFilter) => void
  onAdd: () => void
  onRefresh?: (plantId: string) => void
  onWater?: (plantId: string) => void
  compact?: boolean
  /** The plant just added; its card glows once. */
  freshId?: string
}) {
  const { db, completeTodo } = useStore()
  const { t } = useI18n()
  const [internalFilter, setInternalFilter] = useState<GreenhouseFilter>('all')
  const [careTodo, setCareTodo] = useState<Todo | undefined>()
  const marketReady = isPlacementReady(db.system, 'market.board')
  const todoOn = isFeatureEnabled(db.system, 'todo')
  const requested = filterProp ?? internalFilter
  const filter =
    !marketReady && (requested === 'listed' || requested === 'sold') ? 'all' : requested
  const setFilter = onFilter ?? setInternalFilter
  const careScope = filter === 'upcoming' ? 'upcoming' : filter === 'needs' ? 'due' : null

  const living = plants
  const listed = living.filter((plant) => plant.status === 'listed')
  const ownerId = living[0]?.ownerId
  const ownerTodos = db.todos.filter((todo) => !ownerId || todo.ownerId === ownerId)
  const carePlant = careTodo ? living.find((plant) => plant.id === careTodo.plantId) : undefined
  const openCare = (todo: Todo) => setCareTodo(todo)
  const needing = living.filter((plant) => needsCare(plant, ownerTodos))
  const upcoming = living.filter((plant) => plantHasUpcoming(ownerTodos, plant.id))
  const aiVerified = living.filter((plant) => plant.identification?.source === 'ai')

  const pool =
    filter === 'sold'
      ? sold
      : filter === 'listed'
        ? listed
        : filter === 'ai'
          ? aiVerified
          : filter === 'needs'
            ? needing
            : filter === 'upcoming'
              ? upcoming
              : living

  const empty = living.length === 0 && sold.length === 0
  const visible = pool

  const waterPlants = useMemo(() => {
    if (filter === 'needs') return visible.filter((plant) => plantHasWaterDue(ownerTodos, plant.id))
    if (filter === 'upcoming') return visible.filter((plant) => plantHasUpcomingWater(ownerTodos, plant.id))
    return []
  }, [filter, visible, ownerTodos])
  const photoPlants = useMemo(() => {
    if (filter === 'needs') return visible.filter((plant) => plantHasPhotoDue(ownerTodos, plant.id))
    if (filter === 'upcoming') return visible.filter((plant) => plantHasUpcomingPhoto(ownerTodos, plant.id))
    return []
  }, [filter, visible, ownerTodos])

  const careMode = filter === 'needs' || filter === 'upcoming'
  const list = useInfiniteList(visible, {
    enabled: !compact && !careMode,
    signature: `${filter}|${visible.map((plant) => plant.id).join('|')}`,
  })
  const waterList = useInfiniteList(waterPlants, {
    enabled: !compact && careMode,
    pageSize: CARE_PAGE,
    signature: `${filter}-water|${waterPlants.map((plant) => plant.id).join('|')}`,
  })
  const photoList = useInfiniteList(photoPlants, {
    enabled: !compact && careMode,
    pageSize: CARE_PAGE,
    signature: `${filter}-photo|${photoPlants.map((plant) => plant.id).join('|')}`,
  })

  const filters: { id: GreenhouseFilter; label: string; count: number }[] = [
    { id: 'all', label: t.greenhouse.filterAll, count: living.length },
    { id: 'ai', label: `✦ ${t.addPlant.stampVerified}`, count: aiVerified.length },
    ...(todoOn
      ? [
          { id: 'needs' as const, label: t.greenhouse.filterNeeds, count: needing.length },
          { id: 'upcoming' as const, label: t.greenhouse.filterUpcoming, count: upcoming.length },
        ]
      : []),
    ...(marketReady
      ? [
          { id: 'listed' as const, label: t.greenhouse.filterListed, count: listed.length },
          { id: 'sold' as const, label: t.greenhouse.tabSold, count: sold.length },
        ]
      : []),
  ]

  const shelfRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLElement>(null)
  const [activityHeight, setActivityHeight] = useState<number>()

  useLayoutEffect(() => {
    if (compact) return
    const shelf = shelfRef.current
    const rail = railRef.current
    if (!shelf || !rail) return

    const measure = () => {
      const grid = shelf.querySelector('[data-plant-grid]')
      if (!(grid instanceof HTMLElement) || grid.children.length === 0) {
        setActivityHeight(undefined)
        return
      }
      const railBox = rail.getBoundingClientRect()
      const shelfBox = shelf.getBoundingClientRect()
      if (railBox.top > shelfBox.top + 48) {
        setActivityHeight(undefined)
        return
      }
      const kids = [...grid.children] as HTMLElement[]
      const firstTop = kids[0].offsetTop
      let bottom = kids[0].getBoundingClientRect().bottom
      for (const el of kids) {
        if (el.offsetTop > firstTop + 1) break
        bottom = Math.max(bottom, el.getBoundingClientRect().bottom)
      }
      setActivityHeight(Math.max(220, Math.round(bottom - railBox.top)))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(shelf)
    const grid = shelf.querySelector('[data-plant-grid]')
    if (grid) observer.observe(grid)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [compact, filter, careMode, list.shown.length, waterList.shown.length, photoList.shown.length])

  const careDialog =
    careTodo && carePlant ? (
      <TodoCareDialog
        todo={careTodo}
        plant={carePlant}
        todos={ownerTodos}
        onClose={() => setCareTodo(undefined)}
        onComplete={(todo) => {
          completeTodo(todo.id)
        }}
        onPickFirstWater={(todo, day) => {
          completeTodo(todo.id, day)
        }}
      />
    ) : null

  const shelf = (
    <Growing>
      {!compact && living.length > 0 && !empty ? (
        <Toolbar>
          <FilterBar role="tablist" aria-label={t.greenhouse.title}>
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
        </Toolbar>
      ) : null}

      {careMode && careScope ? (
        waterPlants.length === 0 && photoPlants.length === 0 && !empty ? (
          <Empty>{t.greenhouse.filterEmpty}</Empty>
        ) : (
          <CareSections>
            {waterPlants.length > 0 ? (
              <CareSection>
                <CareSectionHead>
                  <TodoKindIcon kind="water" size={14} />
                  {t.greenhouse.careWatering}
                  <Count>({waterPlants.length})</Count>
                </CareSectionHead>
                <CareGrid data-plant-grid>
                  {waterList.shown.map((plant) => (
                    <GreenhousePlantCard
                      key={`${filter}-water-${plant.id}`}
                      plant={plant}
                      fresh={plant.id === freshId}
                      careKind="water"
                      careScope={careScope}
                      onCare={openCare}
                    />
                  ))}
                </CareGrid>
                <InfiniteSentinel
                  hasMore={waterList.hasMore}
                  onLoadMore={waterList.loadMore}
                  root={shelfRef}
                  tick={waterList.shown.length}
                />
              </CareSection>
            ) : null}
            {photoPlants.length > 0 ? (
              <CareSection>
                <CareSectionHead>
                  <TodoKindIcon kind="photo" size={14} />
                  {t.greenhouse.carePicture}
                  <Count>({photoPlants.length})</Count>
                </CareSectionHead>
                <CareGrid data-plant-grid>
                  {photoList.shown.map((plant) => (
                    <GreenhousePlantCard
                      key={`${filter}-photo-${plant.id}`}
                      plant={plant}
                      fresh={plant.id === freshId}
                      careKind="photo"
                      careScope={careScope}
                      onCare={openCare}
                    />
                  ))}
                </CareGrid>
                <InfiniteSentinel
                  hasMore={photoList.hasMore}
                  onLoadMore={photoList.loadMore}
                  root={shelfRef}
                  tick={photoList.shown.length}
                />
              </CareSection>
            ) : null}
          </CareSections>
        )
      ) : (
        <>
          {visible.length === 0 && !empty ? <Empty>{t.greenhouse.filterEmpty}</Empty> : null}
          <CollectionGrid data-plant-grid>
            {filter === 'all' && <AddPlantCard onClick={onAdd} hero={empty} />}
            {list.shown.map((plant) => (
              <GreenhousePlantCard key={plant.id} plant={plant} fresh={plant.id === freshId} />
            ))}
          </CollectionGrid>
          <InfiniteSentinel
            hasMore={list.hasMore}
            onLoadMore={list.loadMore}
            root={shelfRef}
            tick={list.shown.length}
          />
        </>
      )}
    </Growing>
  )

  if (compact) {
    return (
      <Board>
        {shelf}
        {careDialog}
      </Board>
    )
  }

  return (
    <Board $split>
      <Shelf ref={shelfRef}>{shelf}</Shelf>
      <Rail ref={railRef}>
        <ActivityThread activity={activity} height={activityHeight} />
      </Rail>
      {careDialog}
    </Board>
  )
}
