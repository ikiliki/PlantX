import { Link, useParams } from 'react-router-dom'
import { Grid, PageHeader } from '../../app/AppShell/AppShell.styles'
import { Avatar } from '../../components/Avatar/Avatar'
import { Card } from '../../components/Card/Card'
import { ListingCard } from '../../features/market/components/ListingCard/ListingCard'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import { theme } from '../../theme/tokens'

export function SellerProfilePage() {
  const { id } = useParams()
  const { db } = useStore()
  const { t, tr, locale } = useI18n()
  const user = db.users.find((u) => u.id === id)
  if (!user) return <p>Not found</p>

  const listings = db.listings.filter((l) => l.sellerId === user.id && l.status === 'active')

  return (
    <div>
      <PageHeader>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Avatar name={user.name} color={user.avatarColor} size={64} />
          <div>
            <h1>{locale === 'he' ? user.nameHe : user.name}</h1>
            <p>
              {t.roles[user.role]}
              {user.businessName &&
                ` · ${locale === 'he' ? user.businessNameHe : user.businessName}`}
            </p>
          </div>
        </div>
      </PageHeader>

      <Card style={{ marginBottom: 24 }}>
        <p style={{ marginBottom: 12 }}>{tr(user.bio, user.bioHe)}</p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 12,
          }}
        >
          <div>
            <div style={{ color: theme.colors.muted, fontSize: 12 }}>{t.seller.rating}</div>
            <strong>★ {user.rating}</strong>
          </div>
          <div>
            <div style={{ color: theme.colors.muted, fontSize: 12 }}>{t.seller.orders}</div>
            <strong>{user.completedOrders}</strong>
          </div>
          <div>
            <div style={{ color: theme.colors.muted, fontSize: 12 }}>{t.seller.verification}</div>
            <strong>{Math.round(user.verificationRate * 100)}%</strong>
          </div>
          <div>
            <div style={{ color: theme.colors.muted, fontSize: 12 }}>{t.seller.cancellations}</div>
            <strong>{user.cancellations}</strong>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ color: theme.colors.muted, fontSize: 12, marginBottom: 6 }}>
            {t.seller.specialties}
          </div>
          {(locale === 'he' ? user.specialtiesHe : user.specialties).join(' · ')}
        </div>
      </Card>

      <h2 style={{ marginBottom: 12 }}>{t.market.listings}</h2>
      <Grid>
        {listings.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </Grid>
      <div style={{ marginTop: 16 }}>
        <Link to="/market" style={{ fontWeight: 700 }}>
          ← {t.market.title}
        </Link>
      </div>
    </div>
  )
}
