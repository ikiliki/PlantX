import { FeatureGate } from '../../components/FeatureGate/FeatureGate'
import { GuestCurtain } from '../../components/GuestCurtain/GuestCurtain'
import { GuestView } from '../../components/GuestView/GuestView'
import { PageGate } from '../../components/PageGate/PageGate'
import { GreenhouseLure } from '../../features/discover/components/GreenhouseLure/GreenhouseLure'
import { HomeMobileFloats } from '../../features/discover/components/HomeMobileFloats/HomeMobileFloats'
import { FeedUpdate, FeedUpdateSkeleton, SKELETON_FEED_KINDS } from '../../features/feed/components/FeedUpdate/FeedUpdate'
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
import { useSectionFetch, useServerSlices } from '../../mock/useServerSlices'
import { useStore } from '../../mock/store'
import { forAudience } from '../../theme/audience'
import { isFeatureEnabled } from '../../theme/release'
import type { ComponentView } from '../../theme/view'
import type { Todo } from '../../mock/types'
import { useCallback, useState } from 'react'
import { PullToRefresh } from '../../components/PullToRefresh/PullToRefresh'
import { RefreshButton } from '../../components/RefreshButton/RefreshButton'
import { ScrollTopButton } from '../../components/ScrollTopButton/ScrollTopButton'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { Empty, Feed, FeedTools, Layout, Rail, RailLure, Shell, Widget } from './DiscoverPage.styles'

const WIDGET_ITEMS = 2

function DiscoverFeed({ view, paged }: { view: ComponentView; paged: boolean }) {
  const { t } = useI18n()
  // For now the feed is only XP activities (a new plant, completed care), so it has no filter chips.
  const { items } = useHomeFeed()
  const { db, signedIn, currentUser, completeTodo } = useStore()
  const [careTodo, setCareTodo] = useState<Todo | undefined>()
  const empty = t.feed.empty
  // Refresh is a pull on the phone shell, and a button at the top of the feed when it is wider.
  const mobile = useMediaQuery('(max-width: 899px)')
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
    signature: items.map((item) => item.id).join('|'),
  })
  const shown = view === 'widget' ? items.slice(0, WIDGET_ITEMS) : feed.shown
  const ownerId = signedIn && currentUser ? currentUser.id : null
  const todoOn = isFeatureEnabled(db.system, 'todo') && Boolean(ownerId)
  const todos = ownerId ? db.todos.filter((todo) => todo.ownerId === ownerId) : []
  const plants = ownerId ? db.plants.filter((plant) => plant.ownerId === ownerId) : []
  const carePlant = careTodo ? plants.find((plant) => plant.id === careTodo.plantId) : undefined
  const feedLoading = useSectionFetch(signedIn, ['updates'])
  const skeletonFeed = SKELETON_FEED_KINDS.map((kind, index) => <FeedUpdateSkeleton key={index} kind={kind} />)
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

  const memberFeed = (
    <FeatureGate placement="home.feed" title={t.nav.home}>
      <PullToRefresh enabled={mobile} busy={refreshing} label={t.feed.refreshing} onRefresh={refresh} />
      {mobile ? null : (
        <FeedTools>
          <RefreshButton label={t.feed.refresh} busy={refreshing} onClick={refresh} />
        </FeedTools>
      )}
      {feedLoading ? (
        <GuestCurtain>{skeletonFeed}</GuestCurtain>
      ) : (
        <>
          {feed.total === 0 && <Empty>{empty}</Empty>}
          {shown.map((item, index) => (
            <Reveal key={item.id} index={index}>
              <FeedUpdate update={item.update} />
            </Reveal>
          ))}
          <InfiniteSentinel hasMore={feed.hasMore} onLoadMore={feed.loadMore} tick={feed.shown.length} />
        </>
      )}
    </FeatureGate>
  )

  const guestFeed = (
    <GuestCurtain card={<GuestView card title={t.guest.homeTitle} body={t.guest.homeBody} action={t.guest.logIn} />}>
      {skeletonFeed}
    </GuestCurtain>
  )

  return (
    <Shell>
      <Layout>
        <Rail>
          <RailLure>
            <GreenhouseLure />
          </RailLure>
        </Rail>
        <Feed>
          {forAudience(signedIn, {
            guest: guestFeed,
            signedIn: memberFeed,
          })}
        </Feed>
        <Rail>
          {signedIn ? <TopGreenhouses /> : null}
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
