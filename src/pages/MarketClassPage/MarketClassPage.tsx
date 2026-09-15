import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Badge } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { PlantImage } from '../../components/PlantImage/PlantImage'
import { ProgressBar } from '../../components/ProgressBar/ProgressBar'
import { OrderBook } from '../../features/market/components/OrderBook/OrderBook'
import { PriceChart } from '../../features/market/components/PriceChart/PriceChart'
import { useI18n } from '../../i18n/I18nProvider'
import { GRADE_MEANING } from '../../mock/marketNaming'
import { useStore } from '../../mock/store'
import { theme } from '../../theme/tokens'

const Hero = styled.div`
  display: grid;
  gap: ${theme.space.lg};
  margin-bottom: ${theme.space.lg};
  @media (min-width: 800px) {
    grid-template-columns: 220px 1fr;
  }
`

const Photo = styled.div`
  aspect-ratio: 1;
  border-radius: ${theme.radii.lg};
  overflow: hidden;
  border: 1px solid ${theme.colors.border};
  background: white;
`

const Price = styled.div`
  font-size: clamp(36px, 6vw, 52px);
  font-weight: 800;
  line-height: 1;
  color: ${theme.colors.forest};
`

const Change = styled.span<{ $up: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: ${({ $up }) => ($up ? theme.colors.greenDark : theme.colors.danger)};
  margin-inline-start: 10px;
`

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin: ${theme.space.md} 0;
`

const Stat = styled.div`
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  padding: 12px;
  font-size: 13px;
  color: ${theme.colors.muted};
  strong {
    display: block;
    font-size: 18px;
    margin-top: 4px;
    color: ${theme.colors.ink};
  }
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: ${theme.space.md};
`

const Section = styled.section`
  margin-top: ${theme.space.xl};
  h2 {
    color: ${theme.colors.forest};
    margin-bottom: 12px;
  }
`

const Units = styled.div`
  display: grid;
  gap: 10px;
`

const UnitCard = styled(Link)`
  display: grid;
  grid-template-columns: 56px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: ${theme.radii.md};
  color: ${theme.colors.ink};
  text-decoration: none;
  border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadow.soft};
`

export function MarketClassPage() {
  const { id } = useParams()
  const { db } = useStore()
  const { t, formatMoney, locale, tr } = useI18n()
  const mc = db.marketClasses.find((x) => x.id === id)
  if (!mc) return <p>Not found</p>

  const units = db.plants.filter((p) => p.marketClassId === mc.id)
  const relatedDemand = db.demands.filter(
    (d) => d.marketClassId === mc.id || d.speciesId === mc.speciesId,
  )
  const gradeNote = GRADE_MEANING[mc.quality]

  return (
    <div>
      <Link to="/market" style={{ color: theme.colors.muted, fontSize: 14 }}>
        ← {t.exchange.title}
      </Link>

      <Hero>
        <Photo>
          <PlantImage src={mc.photo} alt="" />
        </Photo>
        <div>
          <Badge $tone="lime">{mc.code}</Badge>
          <h1
            style={{
              marginTop: 10,
              fontSize: 'clamp(22px, 4vw, 32px)',
              color: theme.colors.forest,
            }}
          >
            {locale === 'he' ? mc.displayNameHe : mc.displayName}
          </h1>
          <div style={{ marginTop: 16 }}>
            <Price>
              {formatMoney(mc.lastPrice)}
              <Change $up={mc.changePct >= 0}>
                {mc.changePct >= 0 ? '▲' : '▼'} {Math.abs(mc.changePct).toFixed(1)}%
              </Change>
            </Price>
            <div style={{ color: theme.colors.muted, marginTop: 6, fontSize: 14 }}>
              {t.exchange.perUnit} · {t.exchange.range} {formatMoney(mc.rangeMin)}–
              {formatMoney(mc.rangeMax)}
            </div>
          </div>

          <Stats>
            <Stat>
              {t.exchange.demand}
              <strong>{mc.demandUnits.toLocaleString()}</strong>
            </Stat>
            <Stat>
              {t.exchange.supply}
              <strong>{mc.supplyUnits.toLocaleString()}</strong>
            </Stat>
            <Stat>
              {t.exchange.bids}
              <strong>×{mc.bidQty}</strong>
            </Stat>
            <Stat>
              {t.exchange.asks}
              <strong>×{mc.askQty}</strong>
            </Stat>
          </Stats>

          <Actions>
            <Link to="/sell">
              <Button>{t.exchange.sellSupply}</Button>
            </Link>
            <Link to={relatedDemand[0] ? `/demand/${relatedDemand[0].id}` : '/demand'}>
              <Button variant="secondary">{t.exchange.buyAsk}</Button>
            </Link>
          </Actions>
        </div>
      </Hero>

      <Section>
        <h2>{t.exchange.chart}</h2>
        <Card>
          <PriceChart points={mc.history} up={mc.changePct >= 0} />
          <p style={{ fontSize: 12, color: theme.colors.muted, marginTop: 8 }}>
            {t.exchange.chartNote}
          </p>
        </Card>
      </Section>

      <Section>
        <h2>{t.exchange.orderBook}</h2>
        <OrderBook mc={mc} />
      </Section>

      <Section>
        <h2>{t.exchange.gradeMeaning}</h2>
        <Card>
          <p style={{ color: theme.colors.muted, fontSize: 14 }}>
            <strong style={{ color: theme.colors.ink }}>{mc.quality}:</strong>{' '}
            {locale === 'he' ? gradeNote.he : gradeNote.en}
          </p>
        </Card>
      </Section>

      {relatedDemand.length > 0 && (
        <Section>
          <h2>{t.exchange.bulkDemand}</h2>
          {relatedDemand.map((d) => (
            <Card key={d.id} style={{ marginBottom: 10 }}>
              <Link
                to={`/demand/${d.id}`}
                style={{ color: theme.colors.forest, fontWeight: 700 }}
              >
                {tr(d.title, d.titleHe)}
              </Link>
              <div style={{ marginTop: 10 }}>
                <ProgressBar value={d.committedQty} max={d.targetQty} label={t.demand.progress} />
              </div>
              <div style={{ fontSize: 13, color: theme.colors.muted, marginTop: 8 }}>
                {formatMoney(d.priceMin)}–{formatMoney(d.priceMax)} · {d.dueDate}
              </div>
            </Card>
          ))}
        </Section>
      )}

      <Section>
        <h2>{t.exchange.unitsInClass}</h2>
        <Units>
          {units.length === 0 && <p style={{ color: theme.colors.muted }}>—</p>}
          {units.map((p) => (
            <UnitCard key={p.id} to={`/plants/${p.id}`}>
              <div style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden' }}>
                <PlantImage src={p.photos[0]} alt="" />
              </div>
              <div>
                <strong>{p.code}</strong>
                <div style={{ fontSize: 13, color: theme.colors.muted }}>
                  {tr(p.title, p.titleHe)}
                </div>
              </div>
              <Badge $tone="muted">{p.quality}</Badge>
            </UnitCard>
          ))}
        </Units>
      </Section>
    </div>
  )
}
