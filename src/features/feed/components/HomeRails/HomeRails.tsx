import { Avatar } from '../../../../components/Avatar/Avatar'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import {
  Heading,
  Item,
  Panel,
  PersonCopy,
  PersonMeta,
  PersonName,
} from './HomeRails.styles'

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
