import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../app/AppShell/AppShell.styles'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { Field, FormGrid, Input, Select, TextArea } from '../../components/Form/Form'
import { ProgressBar } from '../../components/ProgressBar/ProgressBar'
import { DemandCard } from '../../features/demand/components/DemandCard/DemandCard'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import type { QualityGrade } from '../../mock/types'
import { theme } from '../../theme/tokens'

export function BusinessConsolePage() {
  const { db, currentUser, createDemand, setCommitmentStatus, aggregateAndConfirm } = useStore()
  const { t, locale, formatMoney } = useI18n()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('Office greenery request')
  const [titleHe, setTitleHe] = useState('בקשת ירוק למשרד')
  const [speciesId, setSpeciesId] = useState('sp-pothos')
  const [targetQty, setTargetQty] = useState(200)
  const [minSupplierQty, setMinSupplierQty] = useState(25)
  const [priceMin, setPriceMin] = useState(8)
  const [priceMax, setPriceMax] = useState(12)
  const [dueDate, setDueDate] = useState('2026-12-15')
  const [notes, setNotes] = useState('Local pickup preferred')
  const [notesHe, setNotesHe] = useState('עדיפות לאיסוף מקומי')

  if (!currentUser || (currentUser.role !== 'business' && currentUser.role !== 'admin')) {
    return (
      <div>
        <PageHeader>
          <h1>{t.business.title}</h1>
        </PageHeader>
        <Card>
          <p>{t.common.guestBlocked}</p>
        </Card>
      </div>
    )
  }

  const mine = db.demands.filter(
    (d) => d.buyerId === currentUser.id || currentUser.role === 'admin',
  )
  const focus = mine[0]
  const commitments = focus
    ? db.commitments.filter((c) => c.demandId === focus.id)
    : []

  const onCreate = (e: FormEvent) => {
    e.preventDefault()
    createDemand({
      title,
      titleHe,
      speciesId,
      targetQty,
      minSupplierQty,
      priceMin,
      priceMax,
      quality: ['A', 'B'],
      region: currentUser.region,
      regionHe: currentUser.regionHe,
      dueDate,
      notes,
      notesHe,
    })
    setShowForm(false)
  }

  return (
    <div>
      <PageHeader>
        <div>
          <h1>{t.business.title}</h1>
          <p>
            {locale === 'he'
              ? currentUser.businessNameHe ?? currentUser.nameHe
              : currentUser.businessName ?? currentUser.name}
          </p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>{t.business.newRequest}</Button>
      </PageHeader>

      {showForm && (
        <Card style={{ marginBottom: 24 }}>
          <form onSubmit={onCreate}>
            <FormGrid>
              <Field>
                title EN
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
              <Field>
                title HE
                <Input value={titleHe} onChange={(e) => setTitleHe(e.target.value)} />
              </Field>
              <Field>
                {t.market.species}
                <Select value={speciesId} onChange={(e) => setSpeciesId(e.target.value)}>
                  {db.species.map((s) => (
                    <option key={s.id} value={s.id}>
                      {locale === 'he' ? s.commonNameHe : s.commonName}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field>
                {t.demand.target}
                <Input
                  type="number"
                  value={targetQty}
                  onChange={(e) => setTargetQty(Number(e.target.value))}
                />
              </Field>
              <Field>
                {t.demand.minQty}
                <Input
                  type="number"
                  value={minSupplierQty}
                  onChange={(e) => setMinSupplierQty(Number(e.target.value))}
                />
              </Field>
              <Field>
                {t.demand.priceRange}
                <div style={{ display: 'flex', gap: 8 }}>
                  <Input
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(Number(e.target.value))}
                  />
                  <Input
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                  />
                </div>
              </Field>
              <Field>
                {t.demand.due}
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </Field>
              <Field>
                notes
                <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} />
              </Field>
              <Button type="submit">{t.common.save}</Button>
            </FormGrid>
          </form>
        </Card>
      )}

      <h2 style={{ marginBottom: 12 }}>{t.business.requests}</h2>
      <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
        {mine.map((d) => (
          <DemandCard key={d.id} demand={d} />
        ))}
      </div>

      {focus && (
        <Card>
          <h2 style={{ marginBottom: 12 }}>{t.business.compare}</h2>
          <ProgressBar
            value={focus.committedQty}
            max={focus.targetQty}
            label={t.demand.progress}
          />
          <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
            {commitments.map((c) => {
              const g = db.users.find((u) => u.id === c.growerId)
              return (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                    padding: 12,
                    background: '#F3F7F4',
                    borderRadius: 12,
                  }}
                >
                  <div>
                    <strong>{locale === 'he' ? g?.nameHe : g?.name}</strong>
                    <div style={{ fontSize: 13, color: theme.colors.muted }}>
                      ×{c.quantity} · {formatMoney(c.offeredPrice)} · {c.quality as QualityGrade} ·{' '}
                      {c.status}
                    </div>
                  </div>
                  {c.status === 'pending' && (
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
          <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button onClick={() => aggregateAndConfirm(focus.id)}>{t.demand.aggregate}</Button>
            <Link to={`/demand/${focus.id}`}>
              <Button variant="ghost">{t.business.fulfillment}</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
