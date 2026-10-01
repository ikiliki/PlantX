import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { Empty, Grade, Heading, Line, Name, Panel, Row } from './TopGreenhouses.styles'

export function TopGreenhouses() {
  const { t, tr, locale } = useI18n()
  const { db, currentUser } = useStore()
  const rows = db.topGreenhouses ?? []

  return (
    <Panel aria-label={t.feed.topGreenhouses}>
      <Heading>{t.feed.topGreenhouses}</Heading>
      {rows.length === 0 && <Empty>{t.feed.topEmpty}</Empty>}
      {rows.map((row) => {
        const user = db.users.find((item) => item.id === row.userId)
        const name = user ? (locale === 'he' ? user.nameHe : user.name) : row.userId
        const href = currentUser?.id === row.userId ? '/greenhouse' : `/sellers/${row.userId}`
        return (
          <Row key={row.id} to={href} data-top-greenhouse={row.userId} data-grade={row.grade}>
            <Grade>{row.grade}</Grade>
            <Name>{name}</Name>
            <Line>{tr(row.line, row.lineHe)}</Line>
          </Row>
        )
      })}
    </Panel>
  )
}
