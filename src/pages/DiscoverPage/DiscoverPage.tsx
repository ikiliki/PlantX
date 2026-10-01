import { FeatureGate } from '../../components/FeatureGate/FeatureGate'
import { PageGate } from '../../components/PageGate/PageGate'
import { GreenhouseLure } from '../../features/discover/components/GreenhouseLure/GreenhouseLure'
import { FeedFilter } from '../../features/feed/components/FeedFilter/FeedFilter'
import { FeedUpdate } from '../../features/feed/components/FeedUpdate/FeedUpdate'
import { MarketRail } from '../../features/feed/components/MarketRail/MarketRail'
import { RankRail } from '../../features/feed/components/RankRail/RankRail'
import { TopGreenhouses } from '../../features/feed/components/TopGreenhouses/TopGreenhouses'
import { WikiRail } from '../../features/feed/components/WikiRail/WikiRail'
import { useHomeFeed } from '../../features/feed/useHomeFeed'
import { InfiniteSentinel, useInfiniteList } from '../../components/InfiniteScroll/InfiniteScroll'
import { Reveal } from '../../components/Reveal/Reveal'
import { useI18n } from '../../i18n/I18nProvider'
import { useServerSlices } from '../../mock/useServerSlices'
import type { ComponentView } from '../../theme/view'
import { Empty, Feed, FeedFilterSlot, Layout, MobileLure, Rail, RailFilter, RailLure, Shell, Widget } from './DiscoverPage.styles'

const WIDGET_ITEMS = 2

function DiscoverFeed({ view, paged }: { view: ComponentView; paged: boolean }) {
  const { t } = useI18n()
  const { items, friendsOnly } = useHomeFeed()
  const empty = friendsOnly ? t.feed.friendsEmpty : t.feed.empty
  const feed = useInfiniteList(items, {
    enabled: paged && view === 'page',
    signature: items.map((item) => item.id).join('|'),
  })
  const shown = view === 'widget' ? items.slice(0, WIDGET_ITEMS) : feed.shown

  if (view === 'widget') {
    return (
      <Widget>
        <FeedFilter />
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
          <RailFilter>
            <FeedFilter />
          </RailFilter>
        </Rail>
        <Feed>
          <FeatureGate placement="home.feed" title={t.nav.home}>
            <MobileLure>
              <GreenhouseLure compact />
            </MobileLure>
            <FeedFilterSlot>
              <FeedFilter />
            </FeedFilterSlot>
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
          <WikiRail />
        </Rail>
      </Layout>
    </Shell>
  )
}

export function DiscoverPage({ view = 'page', paged = true }: { view?: ComponentView; paged?: boolean }) {
  const { t } = useI18n()
  useServerSlices(['users', 'plants', 'updates', 'catalog'])

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
