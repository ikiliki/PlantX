import { Fragment, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FeatureGate } from '../../components/FeatureGate/FeatureGate'
import { FilterChips } from '../../components/FilterChips/FilterChips'
import { GuestCurtain } from '../../components/GuestCurtain/GuestCurtain'
import { GuestView } from '../../components/GuestView/GuestView'
import { InfiniteSentinel, useInfiniteList } from '../../components/InfiniteScroll/InfiniteScroll'
import { PageGate } from '../../components/PageGate/PageGate'
import { PullToRefresh } from '../../components/PullToRefresh/PullToRefresh'
import { RefreshButton } from '../../components/RefreshButton/RefreshButton'
import { ScrollTopButton } from '../../components/ScrollTopButton/ScrollTopButton'
import { FeedPost, FeedPostSkeleton } from '../../features/feed/components/FeedPost/FeedPost'
import { FeedSuggestion, useSuggestionKinds } from '../../features/feed/components/FeedSuggestion/FeedSuggestion'
import { useFeedRefresh } from '../../features/feed/useFeedRefresh'
import { useHomeFeed } from '../../features/feed/useHomeFeed'
import { useI18n } from '../../i18n/I18nProvider'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { useStore } from '../../mock/store'
import { useSectionFetch, useServerSlices } from '../../mock/useServerSlices'
import { forAudience } from '../../theme/audience'
import { Empty, Page, Tools } from './FeedPage.styles'

type FeedFilter = 'all' | 'added' | 'photo' | 'water'

/** A suggestion card after every this-many posts. */
const SUGGEST_EVERY = 4

function FeedStream() {
  const { t } = useI18n()
  const { signedIn } = useStore()
  const { items } = useHomeFeed()
  const kinds = useSuggestionKinds()
  const [filter, setFilter] = useState<FeedFilter>('all')
  const mobile = useMediaQuery('(max-width: 899px)')
  const { refresh, refreshing } = useFeedRefresh()
  const loading = useSectionFetch(signedIn, ['updates'])
  const filtered = filter === 'all' ? items : items.filter((item) => item.update.kind === filter)
  const list = useInfiniteList(filtered, { signature: `${filter}:${filtered.map((item) => item.id).join('|')}` })
  const count = (kind: FeedFilter) => items.filter((item) => item.update.kind === kind).length

  return (
    <>
      <PullToRefresh enabled={mobile} busy={refreshing} label={t.feed.refreshing} onRefresh={refresh} />
      <Tools>
        <FilterChips<FeedFilter>
          label={t.feedPage.filters}
          value={filter}
          onChange={setFilter}
          options={[
            { id: 'all', label: t.feedPage.all, count: items.length },
            { id: 'added', label: t.feedPage.added, count: count('added') },
            { id: 'photo', label: t.feedPage.photo, count: count('photo') },
            { id: 'water', label: t.feedPage.water, count: count('water') },
          ]}
        />
        {mobile ? null : (
          <RefreshButton label={t.feed.refresh} text={t.feed.refresh} busy={refreshing} onClick={refresh} />
        )}
      </Tools>
      {loading ? (
        [0, 1, 2].map((index) => <FeedPostSkeleton key={index} />)
      ) : (
        <>
          {list.total === 0 ? <Empty>{filter === 'all' ? t.feed.empty : t.feedPage.emptyFilter}</Empty> : null}
          {list.shown.map((item, index) => {
            const slot = Math.floor(index / SUGGEST_EVERY)
            const suggest = kinds.length > 0 && index % SUGGEST_EVERY === SUGGEST_EVERY - 1
            return (
              <Fragment key={item.id}>
                <FeedPost update={item.update} />
                {suggest ? <FeedSuggestion kind={kinds[slot % kinds.length]} seed={slot} /> : null}
              </Fragment>
            )
          })}
          <InfiniteSentinel hasMore={list.hasMore} onLoadMore={list.loadMore} tick={list.shown.length} />
        </>
      )}
    </>
  )
}

/** The Feed tab: every greenhouse's public activity as big photo posts, with catalog, rank and market cards mixed in. */
export function FeedPage() {
  const { t } = useI18n()
  const { signedIn } = useStore()
  const navigate = useNavigate()
  useServerSlices(['users', 'plants', 'updates', 'catalog'])

  return (
    <PageGate pageId="feed" title={t.nav.feed}>
      <Page data-feed-page>
        {forAudience(signedIn, {
          // Like Tasks: the page's own shape, blurred (nothing fetched), with the log-in card on top.
          guest: (
            <GuestCurtain
              card={
                <GuestView
                  card
                  title={t.guest.homeTitle}
                  body={t.guest.homeBody}
                  action={t.guest.logIn}
                  secondary={{ label: t.guest.tryAddPlant, onClick: () => navigate('/greenhouse?add=1') }}
                />
              }
            >
              {[0, 1, 2].map((index) => (
                <FeedPostSkeleton key={index} />
              ))}
            </GuestCurtain>
          ),
          signedIn: (
            <FeatureGate placement="feed.board" title={t.nav.feed}>
              <FeedStream />
            </FeatureGate>
          ),
        })}
      </Page>
      <ScrollTopButton label={t.common.backToTop} threshold={600} side="start" />
    </PageGate>
  )
}
