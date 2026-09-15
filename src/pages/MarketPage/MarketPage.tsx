import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import { PageHeader } from '../../app/AppShell/AppShell.styles'
import { Button } from '../../components/Button/Button'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { Field, Input, Select } from '../../components/Form/Form'
import { DemandCard } from '../../features/demand/components/DemandCard/DemandCard'
import { MarketClassCard } from '../../features/market/components/MarketClassCard/MarketClassCard'
import { MarketTicker } from '../../features/market/components/MarketTicker/MarketTicker'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import { theme } from '../../theme/tokens'

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: ${theme.space.md};
  flex-wrap: wrap;
`

const Filters = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  margin-bottom: ${theme.space.lg};
  background: white;
  padding: ${theme.space.md};
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
`

const List = styled.div`
  display: grid;
  gap: 10px;
`

const Note = styled.p`
  font-size: 13px;
  color: ${theme.colors.muted};
  margin-bottom: ${theme.space.md};
`

export function MarketPage() {
  const { db } = useStore()
  const { t, locale } = useI18n()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'demand' ? 'demand' : 'classes'
  const [species, setSpecies] = useState(params.get('species') ?? '')
  const [quality, setQuality] = useState('')
  const [q, setQ] = useState('')

  const classes = useMemo(() => {
    return db.marketClasses.filter((mc) => {
      if (species && mc.speciesId !== species) return false
      if (quality && mc.quality !== quality) return false
      if (q) {
        const hay = `${mc.code} ${mc.displayName} ${mc.displayNameHe}`.toLowerCase()
        if (!hay.includes(q.toLowerCase())) return false
      }
      return true
    })
  }, [db.marketClasses, species, quality, q])

  return (
    <div>
      <PageHeader>
        <div>
          <h1>{t.exchange.title}</h1>
          <p>{t.exchange.subtitle}</p>
        </div>
        <Link to="/sell">
          <Button>{t.exchange.listForSale}</Button>
        </Link>
      </PageHeader>

      <MarketTicker />

      <Note>{t.exchange.standardNote}</Note>

      <Tabs>
        <Button
          size="sm"
          variant={tab === 'classes' ? 'primary' : 'ghost'}
          onClick={() => setParams({ tab: 'classes' })}
        >
          {t.exchange.classes}
        </Button>
        <Button
          size="sm"
          variant={tab === 'demand' ? 'primary' : 'ghost'}
          onClick={() => setParams({ tab: 'demand' })}
        >
          {t.market.demands}
        </Button>
      </Tabs>

      {tab === 'classes' && (
        <>
          <Filters>
            <Field>
              {t.common.search}
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="POT-GOLD…" />
            </Field>
            <Field>
              {t.market.species}
              <Select value={species} onChange={(e) => setSpecies(e.target.value)}>
                <option value="">{t.market.all}</option>
                {db.species.map((s) => (
                  <option key={s.id} value={s.id}>
                    {locale === 'he' ? s.commonNameHe : s.commonName} ({s.ticker})
                  </option>
                ))}
              </Select>
            </Field>
            <Field>
              {t.market.quality}
              <Select value={quality} onChange={(e) => setQuality(e.target.value)}>
                <option value="">{t.market.all}</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </Select>
            </Field>
          </Filters>
          {classes.length === 0 ? (
            <EmptyState title={t.market.empty} />
          ) : (
            <List>{classes.map((mc) => <MarketClassCard key={mc.id} mc={mc} />)}</List>
          )}
        </>
      )}

      {tab === 'demand' && (
        <div style={{ display: 'grid', gap: 12 }}>
          {db.demands.map((d) => (
            <DemandCard key={d.id} demand={d} />
          ))}
        </div>
      )}
    </div>
  )
}
