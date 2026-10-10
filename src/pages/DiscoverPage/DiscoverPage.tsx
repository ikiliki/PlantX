import { FeatureGate } from '../../components/FeatureGate/FeatureGate'
import { PageGate } from '../../components/PageGate/PageGate'
import { GreenhouseLure } from '../../features/discover/components/GreenhouseLure/GreenhouseLure'
import { GuestHomeIntro } from '../../features/discover/components/GuestHomeIntro/GuestHomeIntro'
import { HomeToday } from '../../features/discover/components/HomeToday/HomeToday'
import { FeedUpdate } from '../../features/feed/components/FeedUpdate/FeedUpdate'
import { MarketRail } from '../../features/feed/components/MarketRail/MarketRail'
import { RankRail } from '../../features/feed/components/RankRail/RankRail'
import { WikiRail } from '../../features/feed/components/WikiRail/WikiRail'
import { useHomeFeed } from '../../features/feed/useHomeFeed'
import { Reveal } from '../../components/Reveal/Reveal'
import { useI18n } from '../../i18n/I18nProvider'
import { useServerSlices } from '../../mock/useServerSlices'
import { useStore } from '../../mock/store'
import type { ComponentView } from '../../theme/view'
import { ScrollTopButton } from '../../components/ScrollTopButton/ScrollTopButton'
import { Empty, Feed, Layout, Rail, RailLure, Shell, Widget } from './DiscoverPage.styles'

const WIDGET_ITEMS = 2

function DiscoverFeed({ view }: { view: ComponentView; paged: boolean }) {
  const { t } = useI18n()
  const { items } = useHomeFeed()
  const { signedIn } = useStore()

  if (view === 'widget') {
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

  // A signed-in grower gets the daily Home at every width: today's care, their plants, top greenhouses and
  // a short Social preview (wide screens add a side column). The full feed is its own tab (/social).
  if (signedIn) {
    return (
      <Shell>
        <HomeToday />
        <ScrollTopButton label={t.common.backToTop} threshold={600} side="start" />
      </Shell>
    )
  }

  // A guest gets a short explainer of what PlantX does, not a blurred feed behind a log-in card.
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
