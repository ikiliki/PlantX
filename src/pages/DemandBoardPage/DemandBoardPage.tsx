import { Link } from 'react-router-dom'
import { Grid, PageHeader } from '../../app/AppShell/AppShell.styles'
import { Button } from '../../components/Button/Button'
import { DemandCard } from '../../features/demand/components/DemandCard/DemandCard'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'

export function DemandBoardPage() {
  const { db, currentUser } = useStore()
  const { t } = useI18n()

  return (
    <div>
      <PageHeader>
        <div>
          <h1>{t.demand.title}</h1>
          <p>{t.discover.sub}</p>
        </div>
        {(currentUser?.role === 'business' || currentUser?.role === 'admin') && (
          <Link to="/business">
            <Button>{t.demand.create}</Button>
          </Link>
        )}
      </PageHeader>
      <Grid $min="280px">{db.demands.map((d) => <DemandCard key={d.id} demand={d} />)}</Grid>
    </div>
  )
}
