import { Link } from 'react-router-dom'
import { Grid, PageHeader } from '../../app/AppShell/AppShell.styles'
import { Badge } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { Card, CardBody, CardMedia } from '../../components/Card/Card'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { PlantImage } from '../../components/PlantImage/PlantImage'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import { theme } from '../../theme/tokens'

export function GreenhousePage() {
  const { db, currentUser } = useStore()
  const { t, tr } = useI18n()

  if (!currentUser || currentUser.role === 'guest') {
    return (
      <div>
        <PageHeader>
          <h1>{t.greenhouse.title}</h1>
        </PageHeader>
        <EmptyState title={t.greenhouse.empty} hint={t.common.guestBlocked} />
        <Link to="/claim">
          <Button>{t.claim.title}</Button>
        </Link>
      </div>
    )
  }

  const mine = db.plants.filter((p) => p.ownerId === currentUser.id)
  const owned = mine.filter((p) => p.status === 'owned' || p.status === 'listed')
  const committed = mine.filter((p) => p.status === 'committed')
  const sold = mine.filter((p) => p.status === 'sold' || p.status === 'recovered')
  const myCommitments = db.commitments.filter((c) => c.growerId === currentUser.id)
  const portfolioValue = mine.reduce((sum, p) => {
    const mc = db.marketClasses.find((m) => m.id === p.marketClassId)
    return sum + (mc ? mc.lastPrice * p.quantity : 0)
  }, 0)
  const committedValue = myCommitments.reduce((sum, c) => sum + c.offeredPrice * c.quantity, 0)

  const PlantTile = ({ id }: { id: string }) => {
    const p = db.plants.find((x) => x.id === id)
    if (!p) return null
    return (
      <Link to={`/plants/${p.id}`}>
        <Card $pad={false} $clickable>
          <CardMedia>
            <PlantImage src={p.photos[0]} alt="" />
          </CardMedia>
          <CardBody>
            <strong>{tr(p.title, p.titleHe)}</strong>
            {p.marketClassId && (
              <div style={{ fontSize: 12, color: theme.colors.muted, fontWeight: 700 }}>
                {db.marketClasses.find((m) => m.id === p.marketClassId)?.code}
              </div>
            )}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Badge $tone="muted">{p.status}</Badge>
              {(() => {
                const mc = db.marketClasses.find((m) => m.id === p.marketClassId)
                if (!mc) return null
                return (
                  <Badge $tone="lime">
                    ₪{(mc.lastPrice * p.quantity).toLocaleString()}
                  </Badge>
                )
              })()}
            </div>
          </CardBody>
        </Card>
      </Link>
    )
  }

  return (
    <div>
      <PageHeader>
        <div>
          <h1>{t.greenhouse.title}</h1>
          <p style={{ color: theme.colors.muted }}>
            {t.exchange.portfolio}: <strong>₪{portfolioValue.toLocaleString()}</strong>
            {committedValue > 0 && ` · ${t.greenhouse.commitments} ₪${committedValue.toLocaleString()}`}
          </p>
          <p style={{ color: theme.colors.muted, fontSize: 13 }}>{t.passport.disclaimer}</p>
        </div>
        <Link to="/sell">
          <Button>{t.greenhouse.propagate}</Button>
        </Link>
      </PageHeader>

      <h2 style={{ marginBottom: 12 }}>{t.greenhouse.owned}</h2>
      {owned.length === 0 ? (
        <EmptyState title={t.greenhouse.empty} />
      ) : (
        <Grid>{owned.map((p) => <PlantTile key={p.id} id={p.id} />)}</Grid>
      )}

      <h2 style={{ margin: '24px 0 12px' }}>{t.greenhouse.commitments}</h2>
      <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
        {myCommitments.map((c) => {
          const d = db.demands.find((x) => x.id === c.demandId)
          return (
            <Card key={c.id}>
              <Link to={`/demand/${c.demandId}`}>
                <strong>{d ? tr(d.title, d.titleHe) : c.demandId}</strong>
              </Link>
              <div style={{ color: theme.colors.muted, fontSize: 14 }}>
                ×{c.quantity} · ₪{c.offeredPrice} · {c.status}
              </div>
            </Card>
          )
        })}
        {committed.map((p) => (
          <PlantTile key={p.id} id={p.id} />
        ))}
      </div>

      <h2 style={{ marginBottom: 12 }}>{t.greenhouse.sold}</h2>
      <Grid>{sold.map((p) => <PlantTile key={p.id} id={p.id} />)}</Grid>
    </div>
  )
}
