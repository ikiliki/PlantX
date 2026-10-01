import { FeatureGate } from '../../components/FeatureGate/FeatureGate'
import { PageGate } from '../../components/PageGate/PageGate'
import { GreenhouseLure } from '../../features/discover/components/GreenhouseLure/GreenhouseLure'
import { FeedFilter } from '../../features/feed/components/FeedFilter/FeedFilter'
import { FeedUpdate } from '../../features/feed/components/FeedUpdate/FeedUpdate'
import { ShortcutRail } from '../../features/feed/components/HomeRails/HomeRails'
import { MarketRail } from '../../features/feed/components/MarketRail/MarketRail'
import { RankRail } from '../../features/feed/components/RankRail/RankRail'
import { TopGreenhouses } from '../../features/feed/components/TopGreenhouses/TopGreenhouses'
import { WikiRail } from '../../features/feed/components/WikiRail/WikiRail'
import { useHomeFeed } from '../../features/feed/useHomeFeed'
import { Reveal } from '../../components/Reveal/Reveal'
import { useI18n } from '../../i18n/I18nProvider'
import { useServerSlices } from '../../mock/useServerSlices'
import type { ComponentView } from '../../theme/view'
import { Empty, Feed, Layout, Rail, Shell, Widget } from './DiscoverPage.styles'

const WIDGET_ITEMS = 2

function DiscoverFeed({ view, paged }: { view: ComponentView; paged: boolean }) {
  const { t } = useI18n()
  const { items, hasMore, sentinelRef, friendsOnly } = useHomeFeed({ paged })
  const empty = friendsOnly ? t.feed.friendsEmpty : t.feed.empty
  const shown = view === 'widget' ? items.slice(0, WIDGET_ITEMS) : items

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
          <GreenhouseLure />
          <ShortcutRail />
        </Rail>
        <Feed>
          <FeatureGate placement="home.feed" title={t.nav.home}>
            <FeedFilter />
            {items.length === 0 && <Empty>{empty}</Empty>}
            {items.map((item, index) => (
              <Reveal key={item.id} index={index}>
                <FeedUpdate update={item.update} />
              </Reveal>
            ))}
            {hasMore ? <div ref={sentinelRef} data-feed-more="" style={{ height: 1 }} /> : null}
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
