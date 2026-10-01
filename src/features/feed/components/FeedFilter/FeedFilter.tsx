import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { Bar, Friends, Switch } from './FeedFilter.styles'

export function FeedFilter() {
  const { t } = useI18n()
  const { db, signedIn, setFeedFriendsOnly } = useStore()
  const friendsOnly = Boolean(db.feedFriendsOnly && signedIn)

  return (
    <Bar>
      <Friends
        type="button"
        role="switch"
        aria-checked={friendsOnly}
        aria-label={t.feed.friendsOnly}
        title={signedIn ? t.feed.friendsOnly : t.feed.friendsGuest}
        $on={friendsOnly}
        disabled={!signedIn}
        onClick={() => setFeedFriendsOnly(!db.feedFriendsOnly)}
      >
        <Switch $on={friendsOnly} />
        {t.feed.friendsOnly}
      </Friends>
    </Bar>
  )
}
