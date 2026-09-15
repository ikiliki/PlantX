import { Link } from 'react-router-dom'
import { PageHeader } from '../../app/AppShell/AppShell.styles'
import { Badge } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import { theme } from '../../theme/tokens'

export function AdminPage() {
  const { db, currentUser, resolveModeration } = useStore()
  const { t, tr } = useI18n()

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div>
        <PageHeader>
          <h1>{t.admin.title}</h1>
        </PageHeader>
        <Card>
          <p>{t.common.guestBlocked}</p>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader>
        <div>
          <h1>{t.admin.title}</h1>
          <p>{t.admin.queue}</p>
        </div>
      </PageHeader>

      <div style={{ display: 'grid', gap: 12 }}>
        {db.moderation.map((m) => (
          <Card key={m.id}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
                marginBottom: 8,
              }}
            >
              <strong>{tr(m.title, m.titleHe)}</strong>
              <Badge $tone={m.status === 'open' ? 'warn' : 'muted'}>{m.status}</Badge>
            </div>
            <p style={{ color: theme.colors.muted, fontSize: 14, marginBottom: 12 }}>
              {tr(m.details, m.detailsHe)}
            </p>
            <div style={{ fontSize: 13, marginBottom: 12 }}>
              type: {m.type} · {m.createdAt}
              {m.type === 'claim_draft' && (
                <>
                  {' · '}
                  <Link to="/claim" style={{ fontWeight: 700 }}>
                    {t.claim.title}
                  </Link>
                </>
              )}
              {m.type === 'stolen_photo' && (
                <>
                  {' · '}
                  <Link to="/market" style={{ fontWeight: 700 }}>
                    listing
                  </Link>
                </>
              )}
            </div>
            {m.status === 'open' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <Button size="sm" onClick={() => resolveModeration(m.id, 'resolved')}>
                  {t.admin.resolve}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => resolveModeration(m.id, 'dismissed')}
                >
                  {t.admin.dismiss}
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
