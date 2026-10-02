import { FeatureGate } from '../../components/FeatureGate/FeatureGate'
import { PageGate } from '../../components/PageGate/PageGate'
import { GreenhouseLure } from '../../features/discover/components/GreenhouseLure/GreenhouseLure'
import { HomeMobileFloats } from '../../features/discover/components/HomeMobileFloats/HomeMobileFloats'
import { FeedUpdate } from '../../features/feed/components/FeedUpdate/FeedUpdate'
import { MarketRail } from '../../features/feed/components/MarketRail/MarketRail'
import { RankRail } from '../../features/feed/components/RankRail/RankRail'
import { TopGreenhouses } from '../../features/feed/components/TopGreenhouses/TopGreenhouses'
import { WikiRail } from '../../features/feed/components/WikiRail/WikiRail'
import { TodoTable } from '../../features/todo/components/TodoTable/TodoTable'
import { TodoCareDialog } from '../../features/todo/components/TodoCareDialog/TodoCareDialog'
import { useHomeFeed } from '../../features/feed/useHomeFeed'
import { InfiniteSentinel, useInfiniteList } from '../../components/InfiniteScroll/InfiniteScroll'
import { Reveal } from '../../components/Reveal/Reveal'
import { useI18n } from '../../i18n/I18nProvider'
import { useServerSlices } from '../../mock/useServerSlices'
import { useStore } from '../../mock/store'
import { isFeatureEnabled } from '../../theme/release'
import type { ComponentView } from '../../theme/view'
import type { FeedUpdateKind, Todo } from '../../mock/types'
import { useCallback, useState } from 'react'
import { PullToRefresh } from '../../components/PullToRefresh/PullToRefresh'
import { RefreshButton } from '../../components/RefreshButton/RefreshButton'
import { ScrollTopButton } from '../../components/ScrollTopButton/ScrollTopButton'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { theme } from '../../theme/tokens'
import { useSearchParams } from 'react-router-dom'
import { FilterChips } from '../../components/FilterChips/FilterChips'
import { Empty, Feed, FeedTools, Layout, Rail, RailLure, Shell, Widget } from './DiscoverPage.styles'

const WIDGET_ITEMS = 2

type HomeFeedFilter = 'all' | 'activities' | 'tasks'

/** A new plant and completed care (water, photo) are tasks. Everything else is an activity. */
const TASK_KINDS: FeedUpdateKind[] = ['added', 'water', 'photo']

function homeFeedFilter(value: string | null): HomeFeedFilter {
  if (value === 'all' || value === 'activities' || value === 'tasks') return value
  return 'tasks'
}

function DiscoverFeed({ view, paged }: { view: ComponentView; paged: boolean }) {
  const { t } = useI18n()
  const { items: allItems } = useHomeFeed()
  const { db, signedIn, currentUser, completeTodo } = useStore()
  const [careTodo, setCareTodo] = useState<Todo | undefined>()
  const [params, setParams] = useSearchParams()
  const filter = view === 'page' ? homeFeedFilter(params.get('feed')) : 'all'
  const isTask = (item: (typeof allItems)[number]) => TASK_KINDS.includes(item.update.kind)
  const taskItems = allItems.filter(isTask)
  const activityItems = allItems.filter((item) => !isTask(item))
  const items = filter === 'tasks' ? taskItems : filter === 'activities' ? activityItems : allItems
  const empty = filter === 'all' ? t.feed.empty : t.feed.filterEmpty
  const setFilter = (next: HomeFeedFilter) => {
    const nextParams = new URLSearchParams(params)
    if (next === 'tasks') nextParams.delete('feed')
    else nextParams.set('feed', next)
    setParams(nextParams, { replace: true })
  }
  // Refresh: pull down on a phone, or the icon at the end of the filter row.
  const phone = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)
  const { reloadSlice } = useStore()
  const [refreshing, setRefreshing] = useState(false)
  const refresh = useCallback(() => {
    if (refreshing) return
    setRefreshing(true)
    const minimum = new Promise((resolve) => window.setTimeout(resolve, 600))
    void Promise.all([reloadSlice('updates'), reloadSlice('todos'), reloadSlice('plants'), minimum]).finally(() => setRefreshing(false))
  }, [reloadSlice, refreshing])
  const feed = useInfiniteList(items, {
    enabled: paged && view === 'page',
    signature: `${filter}|${items.map((item) => item.id).join('|')}`,
  })
  const shown = view === 'widget' ? items.slice(0, WIDGET_ITEMS) : feed.shown
  const ownerId = signedIn && currentUser ? currentUser.id : null
  const todoOn = isFeatureEnabled(db.system, 'todo') && Boolean(ownerId)
  const todos = ownerId ? db.todos.filter((todo) => todo.ownerId === ownerId) : []
  const plants = ownerId ? db.plants.filter((plant) => plant.ownerId === ownerId) : []
  const carePlant = careTodo ? plants.find((plant) => plant.id === careTodo.plantId) : undefined
  const openCare = (todo: Todo) => setCareTodo(todo)

  const todoRail = todoOn ? (
    <div data-todo-rail>
      <FeatureGate placement="home.todo" title={t.todo.title}>
        <TodoTable todos={todos} plants={plants} onOpen={openCare} />
      </FeatureGate>
    </div>
  ) : null

  const careDialog =
    careTodo && carePlant ? (
      <TodoCareDialog
        todo={careTodo}
        plant={carePlant}
        todos={todos}
        onClose={() => setCareTodo(undefined)}
        onComplete={(todo) => completeTodo(todo.id)}
        onPickFirstWater={(todo, day) => completeTodo(todo.id, day)}
      />
    ) : null

  if (view === 'widget') {
    return (
      <Widget>
        {shown.length === 0 && <Empty>{empty}</Empty>}
        {shown.map((item, index) => (
          <Reveal key={item.id} index={index}>
            <FeedUpdate update={item.update} />
          </Reveal>
        ))}
      </Widget>
    )
  }

  return (
    <Shell>
      <Layout>
        <Rail>
          <RailLure>
            <GreenhouseLure />
          </RailLure>
        </Rail>
        <Feed>
          <FeatureGate placement="home.feed" title={t.nav.home}>
            <PullToRefresh enabled={phone} busy={refreshing} label={t.feed.refreshing} onRefresh={refresh} />
            <FeedTools>
              <FilterChips
                label={t.feed.filterLabel}
                value={filter}
                onChange={setFilter}
                options={[
                  { id: 'all', label: t.feed.filterAll, count: allItems.length, icon: 'home' },
                  { id: 'activities', label: t.feed.filterActivities, count: activityItems.length, icon: 'greenhouse' },
                  { id: 'tasks', label: t.feed.filterTasks, count: taskItems.length, icon: 'drop' },
                ]}
              />
              {phone ? null : <RefreshButton label={t.feed.refresh} busy={refreshing} onClick={refresh} />}
            </FeedTools>
            {feed.total === 0 && <Empty>{empty}</Empty>}
            {shown.map((item, index) => (
              <Reveal key={item.id} index={index}>
                <FeedUpdate update={item.update} />
              </Reveal>
            ))}
            <InfiniteSentinel hasMore={feed.hasMore} onLoadMore={feed.loadMore} tick={feed.shown.length} />
          </FeatureGate>
        </Feed>
        <Rail>
          <TopGreenhouses />
          <MarketRail />
          <RankRail />
          <div data-wiki-rail>
            <WikiRail />
          </div>
          {/* Needs you today sits under the catalog. */}
          {todoRail}
        </Rail>
      </Layout>
      <HomeMobileFloats />
      {/* Bottom start: the Needs-today chip owns the other corner on phones. */}
      <ScrollTopButton label={t.common.backToTop} threshold={600} side="start" />
      {careDialog}
    </Shell>
  )
}

export function DiscoverPage({ view = 'page', paged = true }: { view?: ComponentView; paged?: boolean }) {
  const { t } = useI18n()
  useServerSlices(['users', 'plants', 'updates', 'todos', 'catalog'])

  return (
    <PageGate pageId="home" title={t.nav.home}>
      {view === 'widget' ? (
        <FeatureGate placement="home.feed" title={t.nav.home}>
          <DiscoverFeed view={view} paged={paged} />
        </FeatureGate>
      ) : (
        <DiscoverFeed view={view} paged={paged} />
      )}
    </PageGate>
  )
}
