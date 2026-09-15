import { FormEvent, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { PageHeader } from '../../app/AppShell/AppShell.styles'
import { Badge } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { Field, FormGrid, Input, TextArea } from '../../components/Form/Form'
import { GradeChip } from '../../components/GradeChip/GradeChip'
import { PlantImage } from '../../components/PlantImage/PlantImage'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import { theme } from '../../theme/tokens'

const Layout = styled.div`
  display: grid;
  gap: ${theme.space.lg};
  @media (min-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
`

const Timeline = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
  li {
    display: grid;
    grid-template-columns: 90px 1fr;
    gap: 12px;
    font-size: 14px;
  }
  time {
    color: ${theme.colors.muted};
    font-weight: 600;
  }
`

export function PassportPage() {
  const { id } = useParams()
  const { db, currentUser, makeOffer, reserveListing } = useStore()
  const { t, tr, formatMoney, locale } = useI18n()
  const navigate = useNavigate()
  const plant = db.plants.find((p) => p.id === id)
  const species = db.species.find((s) => s.id === plant?.speciesId)
  const owner = db.users.find((u) => u.id === plant?.ownerId)
  const listing = db.listings.find((l) => l.plantId === id && l.status === 'active')
  const parent = db.plants.find((p) => p.id === plant?.parentId)
  const marketClass = db.marketClasses.find((m) => m.id === plant?.marketClassId)
  const [offerAmt, setOfferAmt] = useState(listing ? Math.round(listing.price * 0.9) : 0)
  const [msg, setMsg] = useState('')
  const [toast, setToast] = useState('')

  if (!plant) return <p>Not found</p>

  const onOffer = (e: FormEvent) => {
    e.preventDefault()
    if (!listing || !currentUser || currentUser.role === 'guest') {
      setToast(t.common.guestBlocked)
      return
    }
    makeOffer({
      listingId: listing.id,
      amount: offerAmt,
      message: msg || 'Offer',
      messageHe: msg || 'הצעה',
    })
    setToast(t.sell.done)
  }

  const onBuy = () => {
    if (!listing || !currentUser || currentUser.role === 'guest') {
      setToast(t.common.guestBlocked)
      return
    }
    const orderId = reserveListing(listing.id)
    setToast(`${t.messages.intent} (${orderId})`)
  }

  return (
    <div>
      <PageHeader>
        <div>
          <Link to="/market" style={{ color: theme.colors.muted, fontSize: 14 }}>
            ← {t.common.back}
          </Link>
          <h1>{tr(plant.title, plant.titleHe)}</h1>
          <p>
            {plant.code} · {tr(species?.commonName ?? '', species?.commonNameHe ?? '')}
          </p>
        </div>
        {plant.verifiedAt && <Badge $tone="lime">{t.market.verified}</Badge>}
      </PageHeader>

      <Layout>
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ borderRadius: 20, overflow: 'hidden', aspectRatio: '4/3' }}>
            <PlantImage src={plant.photos[0]} alt="" />
          </div>
          <Card>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <GradeChip grade={plant.quality} />
              <span>×{plant.quantity}</span>
              <span>{plant.rooting}</span>
              <span>{plant.sizeGrade}</span>
              {listing && (
                <strong style={{ fontSize: 22, marginInlineStart: 'auto' }}>
                  {formatMoney(listing.price)}
                </strong>
              )}
            </div>
            {marketClass && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 12, color: theme.colors.muted }}>{t.exchange.classes}</div>
                <Link to={`/market/${marketClass.id}`} style={{ fontWeight: 800, color: theme.colors.greenDark }}>
                  {marketClass.code}
                </Link>
                <div style={{ fontSize: 14, marginTop: 4 }}>
                  {locale === 'he' ? marketClass.displayNameHe : marketClass.displayName}
                  {' · '}
                  {formatMoney(marketClass.lastPrice)} / unit
                </div>
              </div>
            )}
            <p style={{ marginTop: 12, fontSize: 13, color: theme.colors.muted }}>
              {t.passport.disclaimer}
            </p>
          </Card>
          {listing && (
            <Card>
              <div style={{ display: 'grid', gap: 10 }}>
                <Button block onClick={onBuy}>
                  {t.market.buy}
                </Button>
                {listing.allowOffers && (
                  <form onSubmit={onOffer}>
                    <FormGrid>
                      <Field>
                        {t.market.offer}
                        <Input
                          type="number"
                          value={offerAmt}
                          onChange={(e) => setOfferAmt(Number(e.target.value))}
                        />
                      </Field>
                      <Field>
                        message
                        <TextArea value={msg} onChange={(e) => setMsg(e.target.value)} />
                      </Field>
                      <Button type="submit" variant="secondary" block>
                        {t.market.offer}
                      </Button>
                    </FormGrid>
                  </form>
                )}
                {toast && <p style={{ fontWeight: 700 }}>{toast}</p>}
              </div>
            </Card>
          )}
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <Card>
            <h2 style={{ marginBottom: 8 }}>{t.passport.owner}</h2>
            {owner && (
              <Link to={`/sellers/${owner.id}`} style={{ fontWeight: 700 }}>
                {locale === 'he' ? owner.nameHe : owner.name} · ★ {owner.rating}
              </Link>
            )}
            <div style={{ marginTop: 12, fontSize: 14, color: theme.colors.muted }}>
              {t.passport.lastVerified}: {plant.verifiedAt ?? '—'}
            </div>
          </Card>

          <Card>
            <h2 style={{ marginBottom: 12 }}>{t.passport.lineage}</h2>
            {parent ? (
              <Link to={`/plants/${parent.id}`}>
                {t.passport.parent}: {tr(parent.title, parent.titleHe)}
              </Link>
            ) : (
              <span style={{ color: theme.colors.muted }}>—</span>
            )}
          </Card>

          <Card>
            <h2 style={{ marginBottom: 12 }}>{t.passport.history}</h2>
            <Timeline>
              {plant.history.map((h, i) => (
                <li key={i}>
                  <time>{h.at}</time>
                  <span>{tr(h.label, h.labelHe)}</span>
                </li>
              ))}
            </Timeline>
          </Card>

          <Card>
            <h2 style={{ marginBottom: 12 }}>{t.passport.comps}</h2>
            {plant.comps?.length ? (
              <div style={{ display: 'grid', gap: 8 }}>
                {plant.comps.map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>
                      {c.date} · {tr(c.note, c.noteHe)}
                    </span>
                    <strong>{formatMoney(c.price)}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: theme.colors.muted }}>{t.passport.noComps}</p>
            )}
          </Card>

          {owner && (
            <Button variant="ghost" onClick={() => navigate(`/sellers/${owner.id}`)}>
              {locale === 'he' ? owner.nameHe : owner.name}
            </Button>
          )}
        </div>
      </Layout>
    </div>
  )
}
