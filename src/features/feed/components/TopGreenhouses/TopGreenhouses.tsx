import { GreenhouseCard, greenhouseHref, greenhouseShelf } from '../../../greenhouse/components/GreenhouseCard/GreenhouseCard'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { Plant } from '../../../../mock/types'
import { Empty, Heading, List, Panel } from './TopGreenhouses.styles'

function livingCount(plants: Plant[], ownerId: string) {
  return plants.filter((plant) => plant.ownerId === ownerId && (plant.status === 'owned' || plant.status === 'listed')).length
}

export function TopGreenhouses() {
  const { t, tr } = useI18n()
  const { db, currentUser } = useStore()
  const verified = db.verifiedGreenhouseIds
  const rows = Array.isArray(verified)
    ? verified.map((userId) => ({ userId, detail: undefined as string | undefined }))
    : (db.topGreenhouses ?? []).map((row) => ({ userId: row.userId, detail: tr(row.line, row.lineHe) }))
  const title = Array.isArray(verified) ? t.greenhouse.verified : t.feed.topGreenhouses

  return (
    <Panel aria-label={title}>
      <Heading>{title}</Heading>
      {rows.length === 0 && <Empty>{t.feed.topEmpty}</Empty>}
      <List>
        {rows.map((row) => {
          const user = db.users.find((item) => item.id === row.userId && item.role !== 'guest')
          if (!user) return null
          return (
            <GreenhouseCard
              key={row.userId}
              user={user}
              href={greenhouseHref(user.id, currentUser?.id)}
              plantCount={livingCount(db.plants, user.id)}
              photos={greenhouseShelf(db.plants, user.id)}
              detail={row.detail}
              verified={Array.isArray(verified)}
              compact
            />
          )
        })}
      </List>
    </Panel>
  )
}
