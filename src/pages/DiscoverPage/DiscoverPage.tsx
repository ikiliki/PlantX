import { FeatureGate } from '../../components/FeatureGate/FeatureGate'
import { PageGate } from '../../components/PageGate/PageGate'
import { Reveal } from '../../components/Reveal/Reveal'
import { ScrollTopButton } from '../../components/ScrollTopButton/ScrollTopButton'
import { GreenhouseLure } from '../../features/discover/components/GreenhouseLure/GreenhouseLure'
import { GuestHomeIntro } from '../../features/discover/components/GuestHomeIntro/GuestHomeIntro'
import { HomeToday } from '../../features/discover/components/HomeToday/HomeToday'
import { FeedUpdate } from '../../features/feed/components/FeedUpdate/FeedUpdate'
import { MarketRail } from '../../features/feed/components/MarketRail/MarketRail'
import { RankRail } from '../../features/feed/components/RankRail/RankRail'
import { WikiRail } from '../../features/feed/components/WikiRail/WikiRail'
import { useHomeFeed } from '../../features/feed/useHomeFeed'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import { useServerSlices } from '../../mock/useServerSlices'
import type { ComponentView } from '../../theme/view'
import { Empty, Feed, Layout, Rail, RailLure, Shell, Widget } from './DiscoverPage.styles'

const WIDGET_ITEMS = 2

/** Admin previews and other frames: the newest two activities. */
function HomeWidget() {
  const { t } = useI18n()
  const { items } = useHomeFeed()
  const shown = items.slice(0, WIDGET_ITEMS)
  return (
    <Widget>
      {shown.length === 0 && <Empty>{t.feed.empty}</Empty>}
      {shown.map((item, index) => (
        <Reveal key={item.id} index={index}>
          <FeedUpdate update={item.update} />
        </Reveal>
      ))}
    </Widget>
  )
}

/**
 * Home. A member gets the daily view on every width (`HomeToday`: care, plants, then short rows; the full feed
 * is the Feed tab). A guest gets the explainer, with the greenhouse lure, market, rank and catalog rails beside
 * it when there is room.
 */
function HomeBody() {
  const { t } = useI18n()
  const { signedIn } = useStore()

  if (signedIn) {
    return (
      <Shell>
        <HomeToday />
        <ScrollTopButton label={t.common.backToTop} threshold={600} side="start" />
      </Shell>
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
          <GuestHomeIntro />
        </Feed>
        <Rail>
          <MarketRail />
          <RankRail />
          <div data-wiki-rail>
            <WikiRail />
          </div>
        </Rail>
      </Layout>
      <ScrollTopButton label={t.common.backToTop} threshold={600} side="start" />
    </Shell>
  )
}

export function DiscoverPage({ view = 'page' }: { view?: ComponentView }) {
  const { t } = useI18n()
  useServerSlices(['users', 'plants', 'updates', 'todos', 'catalog'])

  return (
    <PageGate pageId="home" title={t.nav.home}>
      {view === 'widget' ? (
        <FeatureGate placement="home.feed" title={t.nav.home}>
          <HomeWidget />
        </FeatureGate>
      ) : (
        <HomeBody />
      )}
    </PageGate>
  )
}
