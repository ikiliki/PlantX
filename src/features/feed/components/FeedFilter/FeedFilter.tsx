import { Icon } from '../../../../components/Icon/Icon'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { Bar, Choice } from './FeedFilter.styles'

export function FeedFilter() {
  const { t } = useI18n()
  const { db, signedIn, setFeedFriendsOnly } = useStore()
  const friendsOnly = Boolean(db.feedFriendsOnly && signedIn)

  return (
    <Bar role="group" aria-label={t.feed.filterLabel}>
      <Choice
        type="button"
        aria-pressed={!friendsOnly}
        aria-label={t.feed.everyone}
        title={t.feed.everyone}
        $on={!friendsOnly}
        onClick={() => setFeedFriendsOnly(false)}
      >
        <Icon name="globe" size={20} />
      </Choice>
      <Choice
        type="button"
        aria-pressed={friendsOnly}
        aria-label={t.feed.friendsOnly}
        title={signedIn ? t.feed.friendsOnly : t.feed.friendsGuest}
        $on={friendsOnly}
        disabled={!signedIn}
        onClick={() => setFeedFriendsOnly(true)}
      >
        <Icon name="friends" size={20} />
      </Choice>
    </Bar>
  )
}
