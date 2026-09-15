import { useMemo, useState } from 'react'
import styled from 'styled-components'
import { PageHeader } from '../../app/AppShell/AppShell.styles'
import { Badge } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { Field, Select } from '../../components/Form/Form'
import { PlantImage } from '../../components/PlantImage/PlantImage'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import type { QualityGrade } from '../../mock/types'
import { theme } from '../../theme/tokens'

const Phases = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 8px;
  margin-bottom: ${theme.space.lg};
`

const Phase = styled.div<{ $on?: boolean; $done?: boolean }>`
  padding: 10px;
  border-radius: ${theme.radii.md};
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  background: ${({ $on, $done }) =>
    $on ? theme.colors.lime : $done ? '#D8F5E3' : '#E8EEEA'};
  color: ${theme.colors.forest};
`

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 56px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid ${theme.colors.border};
`

const phaseOrder = [
  'sourcing',
  'confirmed',
  'in_use',
  'recovery',
  'graded',
  'redistributed',
] as const

export function EventsPage() {
  const { db, currentUser, setEventPhase, gradeRecovery, redistributeEvent } = useStore()
  const { t, tr, formatMoney, locale } = useI18n()
  const event = db.events.find((e) => e.buyerId === currentUser?.id) ?? db.events[0]
  const order = db.orders.find((o) => o.id === event?.orderId)

  const initialGrades = useMemo(() => {
    if (!event) return {}
    const map: Record<string, QualityGrade | 'lost' | 'damaged'> = {}
    event.required.forEach((_, i) => {
      const plantId = order?.items[i]?.plantId
      if (plantId) map[plantId] = 'B'
    })
    // map event plants
    ;['pl-event-pothos', 'pl-event-monstera', 'pl-event-mix'].forEach((id) => {
      map[id] = 'B'
    })
    return map
  }, [event, order])

  const [grades, setGrades] = useState(initialGrades)
  const [dest, setDest] = useState('offices')

  if (!currentUser || (currentUser.role !== 'event' && currentUser.role !== 'admin')) {
    return (
      <div>
        <PageHeader>
          <h1>{t.events.title}</h1>
        </PageHeader>
        <Card>
          <p>{t.common.guestBlocked}</p>
        </Card>
      </div>
    )
  }

  if (!event || !order) {
    return (
      <div>
        <PageHeader>
          <h1>{t.events.title}</h1>
        </PageHeader>
        <Card>
          <p>No event pilot loaded</p>
        </Card>
      </div>
    )
  }

  const idx = phaseOrder.indexOf(event.phase)

  return (
    <div>
      <PageHeader>
        <div>
          <h1>{t.events.title}</h1>
          <p>
            {tr(event.name, event.nameHe)} · {locale === 'he' ? event.venueHe : event.venue}
          </p>
        </div>
        <Badge $tone="lime">{event.phase}</Badge>
      </PageHeader>

      <Phases>
        {phaseOrder.map((p, i) => (
          <Phase key={p} $on={p === event.phase} $done={i < idx}>
            {p}
          </Phase>
        ))}
      </Phases>

      <Card style={{ marginBottom: 16 }}>
        <h2 style={{ marginBottom: 8 }}>{t.events.orderSummary}</h2>
        <p style={{ color: theme.colors.muted, marginBottom: 12 }}>
          {tr(event.name, event.nameHe)}
        </p>
        {order.items.map((item) => (
          <ItemRow key={item.plantId}>
            <div style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden' }}>
              <PlantImage src={item.photo} alt="" />
            </div>
            <div>
              <strong>{tr(item.title, item.titleHe)}</strong>
              <div style={{ fontSize: 13, color: theme.colors.muted }}>×{item.qty}</div>
            </div>
            <strong>{formatMoney(item.unitPrice * item.qty)}</strong>
          </ItemRow>
        ))}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 12,
            fontSize: 18,
            fontWeight: 800,
          }}
        >
          <span>{t.events.estimated}</span>
          <span>{formatMoney(order.total)}</span>
        </div>
        <p style={{ marginTop: 8, color: theme.colors.greenDark, fontWeight: 700 }}>
          ✓ {t.events.deliveryBy} · {order.deliveryDate}
        </p>
      </Card>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {event.phase === 'confirmed' && (
          <Button onClick={() => setEventPhase(event.id, 'in_use')}>{t.events.confirm} → in use</Button>
        )}
        {event.phase === 'in_use' && (
          <Button onClick={() => setEventPhase(event.id, 'recovery')}>{t.events.recover}</Button>
        )}
        {event.phase === 'sourcing' && (
          <Button onClick={() => setEventPhase(event.id, 'confirmed')}>{t.events.confirm}</Button>
        )}
      </div>

      {(event.phase === 'recovery' || event.phase === 'graded' || event.phase === 'redistributed') && (
        <Card style={{ marginBottom: 16 }}>
          <h2 style={{ marginBottom: 12 }}>{t.events.grade}</h2>
          {(['pl-event-pothos', 'pl-event-monstera', 'pl-event-mix'] as const).map((pid) => {
            const plant = db.plants.find((p) => p.id === pid)
            return (
              <div
                key={pid}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <span>{plant ? tr(plant.title, plant.titleHe) : pid}</span>
                <Select
                  style={{ maxWidth: 160 }}
                  value={grades[pid] ?? 'B'}
                  disabled={event.phase !== 'recovery'}
                  onChange={(e) =>
                    setGrades((g) => ({
                      ...g,
                      [pid]: e.target.value as QualityGrade | 'lost' | 'damaged',
                    }))
                  }
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="damaged">damaged</option>
                  <option value="lost">lost</option>
                </Select>
              </div>
            )
          })}
          {event.phase === 'recovery' && (
            <Button
              onClick={() =>
                gradeRecovery(
                  event.id,
                  Object.entries(grades).map(([plantId, grade]) => ({
                    plantId,
                    grade,
                    notes: 'Inspected after event',
                    notesHe: 'נבדק אחרי האירוע',
                  })),
                )
              }
            >
              {t.events.grade}
            </Button>
          )}
        </Card>
      )}

      {(event.phase === 'graded' || event.phase === 'redistributed') && (
        <Card>
          <h2 style={{ marginBottom: 12 }}>{t.events.redistribute}</h2>
          <Field>
            {t.events.destination}
            <Select value={dest} onChange={(e) => setDest(e.target.value)}>
              <option value="offices">{t.events.offices}</option>
              <option value="shops">{t.events.shops}</option>
              <option value="collectors">{t.events.collectors}</option>
              <option value="otherEvents">{t.events.otherEvents}</option>
            </Select>
          </Field>
          {event.phase === 'graded' && (
            <div style={{ marginTop: 12 }}>
              <Button onClick={() => redistributeEvent(event.id, dest)}>
                {t.events.redistribute}
              </Button>
            </div>
          )}
          {event.redistributedTo && (
            <p style={{ marginTop: 12, fontWeight: 700 }}>
              → {event.redistributedTo}
            </p>
          )}
        </Card>
      )}
    </div>
  )
}
