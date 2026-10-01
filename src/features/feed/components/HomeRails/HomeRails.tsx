import { Avatar } from '../../../../components/Avatar/Avatar'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { isPlacementEnabled, type PlacementId } from '../../../../theme/release'
import {
  Heading,
  Item,
  Mark,
  Panel,
  PersonCopy,
  PersonMeta,
  PersonName,
} from './HomeRails.styles'

export function ShortcutRail() {
  const { t } = useI18n()
  const { db } = useStore()

  const links = (
    [
      { to: '/greenhouse', label: t.nav.greenhouse, mark: '⚘', board: 'greenhouse.board' },
      { to: '/market', label: t.nav.market, mark: '◈', board: 'market.board' },
      { to: '/rank', label: t.nav.rank, mark: '✦', board: 'rank.board' },
      { to: '/wiki', label: t.nav.wiki, mark: '❧', board: 'wiki.board' },
    ] as const
  ).filter((link) => isPlacementEnabled(db.system, link.board as PlacementId))

  return (
    <Panel>
      <Heading>{t.feed.shortcuts}</Heading>
      {links.map((link) => (
        <Item key={link.to} to={link.to}>
          <Mark aria-hidden>{link.mark}</Mark>
          {link.label}
        </Item>
      ))}
    </Panel>
  )
}

export function PeopleRail() {
  const { t, locale } = useI18n()
  const { db, currentUser } = useStore()
  const people = db.users
    .filter((user) => user.role !== 'guest' && user.id !== currentUser?.id)
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <Panel>
      <Heading>{t.feed.people}</Heading>
      {people.map((user) => {
        const name = locale === 'he' ? user.nameHe : user.name
        const place = locale === 'he' ? user.regionHe : user.region
        return (
          <Item key={user.id} to={`/sellers/${user.id}`}>
            <Avatar name={name} color={user.avatarColor} size={36} />
            <PersonCopy>
              <PersonName>{name}</PersonName>
              <PersonMeta>
                {t.roles[user.role]} · {place}
              </PersonMeta>
            </PersonCopy>
          </Item>
        )
      })}
    </Panel>
  )
}
