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
import type { Todo } from '../../mock/types'
import { useState } from 'react'
import { Empty, Feed, Layout, Rail, RailLure, Shell, Widget } from './DiscoverPage.styles'

const WIDGET_ITEMS = 2

function DiscoverFeed({ view, paged }: { view: ComponentView; paged: boolean }) {
  const { t } = useI18n()
  const { items } = useHomeFeed()
  const { db, signedIn, currentUser, completeTodo } = useStore()
  const [careTodo, setCareTodo] = useState<Todo | undefined>()
  const empty = t.feed.empty
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
          {todoRail}
          <TopGreenhouses />
          <MarketRail />
          <RankRail />
          <div data-wiki-rail>
            <WikiRail />
          </div>
        </Rail>
      </Layout>
      <HomeMobileFloats />
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
