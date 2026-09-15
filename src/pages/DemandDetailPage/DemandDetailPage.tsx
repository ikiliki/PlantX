import { FormEvent, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { PageHeader } from '../../app/AppShell/AppShell.styles'
import { Badge } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { Field, FormGrid, Input, Select } from '../../components/Form/Form'
import { ProgressBar } from '../../components/ProgressBar/ProgressBar'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import type { QualityGrade } from '../../mock/types'
import { theme } from '../../theme/tokens'

const Layout = styled.div`
  display: grid;
  gap: ${theme.space.lg};
  @media (min-width: 900px) {
    grid-template-columns: 1.2fr 0.8fr;
  }
`

export function DemandDetailPage() {
  const { id } = useParams()
  const { db, currentUser, commitToDemand, setCommitmentStatus, aggregateAndConfirm } = useStore()
  const { t, tr, formatMoney, locale } = useI18n()
  const demand = db.demands.find((d) => d.id === id)
  const commitments = db.commitments.filter((c) => c.demandId === id)
  const [qty, setQty] = useState(25)
  const [price, setPrice] = useState(10)
  const [quality, setQuality] = useState<QualityGrade>('B')
  const [available, setAvailable] = useState('2026-10-30')
  const [done, setDone] = useState(false)

  if (!demand) return <p>Not found</p>

  const canCommit =
    currentUser &&
    (currentUser.role === 'grower' || currentUser.role === 'nursery') &&
    qty >= demand.minSupplierQty

  const isBuyer = currentUser?.id === demand.buyerId || currentUser?.role === 'admin'

  const onCommit = (e: FormEvent) => {
    e.preventDefault()
    if (!canCommit) return
    commitToDemand({
      demandId: demand.id,
      quantity: qty,
      offeredPrice: price,
      quality,
      availableDate: available,
    })
    setDone(true)
  }

  return (
    <div>
      <PageHeader>
        <div>
          <Link to="/demand" style={{ color: theme.colors.muted, fontSize: 14 }}>
            ← {t.common.back}
          </Link>
          <h1>{tr(demand.title, demand.titleHe)}</h1>
          <p>{tr(demand.notes, demand.notesHe)}</p>
        </div>
        <Badge $tone="lime">{demand.status}</Badge>
      </PageHeader>

      <Layout>
        <div style={{ display: 'grid', gap: 16 }}>
          <Card>
            <ProgressBar
              value={demand.committedQty}
              max={demand.targetQty}
              label={`${t.demand.committed} / ${t.demand.target}`}
            />
            <div
              style={{
                display: 'grid',
                gap: 8,
                marginTop: 16,
                color: theme.colors.muted,
                fontSize: 14,
              }}
            >
              <div>
                {t.demand.priceRange}: {formatMoney(demand.priceMin)}–{formatMoney(demand.priceMax)}
              </div>
              <div>
                {t.demand.minQty}: {demand.minSupplierQty}
              </div>
              <div>
                {t.demand.due}: {demand.dueDate} ·{' '}
                {locale === 'he' ? demand.regionHe : demand.region}
              </div>
            </div>
          </Card>

          <Card>
            <h2 style={{ marginBottom: 12 }}>{t.demand.suppliers}</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {commitments.map((c) => {
                const grower = db.users.find((u) => u.id === c.growerId)
                return (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      flexWrap: 'wrap',
                      padding: 12,
                      borderRadius: 12,
                      background: '#F3F7F4',
                    }}
                  >
                    <div>
                      <strong>{locale === 'he' ? grower?.nameHe : grower?.name}</strong>
                      <div style={{ fontSize: 13, color: theme.colors.muted }}>
                        ×{c.quantity} · {formatMoney(c.offeredPrice)} · {c.quality} · {c.status}
                      </div>
                    </div>
                    {isBuyer && c.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button size="sm" onClick={() => setCommitmentStatus(c.id, 'accepted')}>
                          {t.demand.accept}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setCommitmentStatus(c.id, 'rejected')}
                        >
                          {t.demand.reject}
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            {isBuyer && demand.status !== 'confirmed' && demand.status !== 'fulfilled' && (
              <div style={{ marginTop: 16 }}>
                <Button
                  block
                  onClick={() => {
                    const orderId = aggregateAndConfirm(demand.id)
                    window.location.hash = ''
                    alert(`${t.demand.aggregate}: ${orderId}`)
                  }}
                >
                  {t.demand.aggregate}
                </Button>
              </div>
            )}
          </Card>
        </div>

        <Card>
          <h2 style={{ marginBottom: 12 }}>{t.demand.commit}</h2>
          {!currentUser || currentUser.role === 'guest' ? (
            <p>{t.common.guestBlocked}</p>
          ) : done ? (
            <p style={{ fontWeight: 700, color: theme.colors.greenDark }}>{t.sell.done}</p>
          ) : (
            <form onSubmit={onCommit}>
              <FormGrid>
                <Field>
                  {t.demand.qty}
                  <Input
                    type="number"
                    min={demand.minSupplierQty}
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                  />
                </Field>
                <Field>
                  {t.demand.yourPrice}
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />
                </Field>
                <Field>
                  {t.demand.yourCommit} quality
                  <Select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as QualityGrade)}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </Select>
                </Field>
                <Field>
                  {t.demand.available}
                  <Input
                    type="date"
                    value={available}
                    onChange={(e) => setAvailable(e.target.value)}
                  />
                </Field>
                <Button type="submit" block disabled={!canCommit}>
                  {t.demand.submit}
                </Button>
              </FormGrid>
            </form>
          )}
        </Card>
      </Layout>
    </div>
  )
}
