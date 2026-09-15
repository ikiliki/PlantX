import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../app/AppShell/AppShell.styles'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { Input } from '../../components/Form/Form'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import { theme } from '../../theme/tokens'

export function MessagesPage() {
  const { db, currentUser, setOfferStatus, completeHandoff, sendMessage } = useStore()
  const { t, tr, formatMoney, locale } = useI18n()
  const [draft, setDraft] = useState<Record<string, string>>({})

  if (!currentUser || currentUser.role === 'guest') {
    return (
      <div>
        <PageHeader>
          <h1>{t.messages.title}</h1>
        </PageHeader>
        <EmptyState title={t.messages.empty} hint={t.common.guestBlocked} />
      </div>
    )
  }

  const offers = db.offers.filter(
    (o) => o.fromUserId === currentUser.id || o.toUserId === currentUser.id,
  )
  const threads = db.threads.filter((th) => th.participants.includes(currentUser.id))
  const handoffs = db.orders.filter(
    (o) =>
      o.status === 'handoff' &&
      (o.buyerId === currentUser.id || o.sellerIds.includes(currentUser.id)),
  )

  const onSend = (e: FormEvent, threadId: string) => {
    e.preventDefault()
    const body = draft[threadId]?.trim()
    if (!body) return
    sendMessage(threadId, body, body)
    setDraft((d) => ({ ...d, [threadId]: '' }))
  }

  return (
    <div>
      <PageHeader>
        <h1>{t.messages.title}</h1>
      </PageHeader>

      {handoffs.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ marginBottom: 12 }}>{t.messages.handoff}</h2>
          {handoffs.map((o) => (
            <Card key={o.id} style={{ marginBottom: 12 }}>
              <strong>
                {o.items.map((i) => tr(i.title, i.titleHe)).join(', ')} · {formatMoney(o.total)}
              </strong>
              <p style={{ color: theme.colors.muted, fontSize: 14, margin: '8px 0' }}>
                {o.handoffNotes}
              </p>
              <Button onClick={() => completeHandoff(o.id)}>{t.messages.handoff}</Button>
            </Card>
          ))}
        </section>
      )}

      <h2 style={{ marginBottom: 12 }}>{t.messages.offers}</h2>
      {offers.length === 0 ? (
        <EmptyState title={t.messages.empty} />
      ) : (
        offers.map((o) => {
          const listing = db.listings.find((l) => l.id === o.listingId)
          const plant = db.plants.find((p) => p.id === listing?.plantId)
          const from = db.users.find((u) => u.id === o.fromUserId)
          return (
            <Card key={o.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <strong>{formatMoney(o.amount)}</strong> · {o.status}
                  <div style={{ fontSize: 14, color: theme.colors.muted }}>
                    {plant && tr(plant.title, plant.titleHe)} ·{' '}
                    {locale === 'he' ? from?.nameHe : from?.name}
                  </div>
                  <p style={{ marginTop: 8 }}>{tr(o.message, o.messageHe)}</p>
                </div>
                {o.toUserId === currentUser.id && o.status === 'open' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button size="sm" onClick={() => setOfferStatus(o.id, 'accepted')}>
                      {t.messages.accept}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setOfferStatus(o.id, 'declined')}
                    >
                      {t.messages.decline}
                    </Button>
                  </div>
                )}
              </div>
              {listing && (
                <Link to={`/plants/${listing.plantId}`} style={{ fontSize: 13, fontWeight: 700 }}>
                  → passport
                </Link>
              )}
            </Card>
          )
        })
      )}

      <h2 style={{ margin: '24px 0 12px' }}>{t.messages.threads}</h2>
      {threads.map((th) => (
        <Card key={th.id} style={{ marginBottom: 12 }}>
          <strong>{tr(th.subject, th.subjectHe)}</strong>
          <div style={{ display: 'grid', gap: 8, margin: '12px 0' }}>
            {th.messages.map((m) => {
              const u = db.users.find((x) => x.id === m.fromUserId)
              return (
                <div
                  key={m.id}
                  style={{
                    background: m.fromUserId === currentUser.id ? '#E8F8EC' : '#F3F7F4',
                    padding: 10,
                    borderRadius: 12,
                  }}
                >
                  <div style={{ fontSize: 12, color: theme.colors.muted, fontWeight: 700 }}>
                    {locale === 'he' ? u?.nameHe : u?.name} · {new Date(m.at).toLocaleString()}
                  </div>
                  <div>{tr(m.body, m.bodyHe)}</div>
                </div>
              )
            })}
          </div>
          <form
            onSubmit={(e) => onSend(e, th.id)}
            style={{ display: 'flex', gap: 8 }}
          >
            <Input
              value={draft[th.id] ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, [th.id]: e.target.value }))}
              placeholder="…"
            />
            <Button type="submit">{t.messages.send}</Button>
          </form>
        </Card>
      ))}
    </div>
  )
}
