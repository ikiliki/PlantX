import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FeatureGate } from '../../components/FeatureGate/FeatureGate'
import { PageGate } from '../../components/PageGate/PageGate'
import { PlantImage } from '../../components/PlantImage/PlantImage'
import { classRow, filterByHealth, healthOptions, speciesName, tradesFor } from '../../features/market/categoryData'
import { ChartPanel } from '../../features/market/components/ChartPanel/ChartPanel'
import { HealthFilter } from '../../features/market/components/HealthFilter/HealthFilter'
import { PriceRanges } from '../../features/market/components/PriceRanges/PriceRanges'
import { StockChart } from '../../features/market/components/StockChart/StockChart'
import { TradeChart } from '../../features/market/components/TradeChart/TradeChart'
import { TradeTable } from '../../features/market/components/TradeTable/TradeTable'
import { WikiArticle } from '../../features/species/components/WikiArticle/WikiArticle'
import { useI18n } from '../../i18n/I18nProvider'
import { HEALTH_RANK } from '../../mock/catalog'
import { averageHistory } from '../../mock/marketHistory'
import { useStore } from '../../mock/store'
import { useServerSlices } from '../../mock/useServerSlices'
import { Crumb, Crumbs, Head, Mark, Missing, Page, Scientific, Summary, SummaryStat } from './CategoryPage.styles'

function CategoryReady({ speciesId: speciesIdProp }: { speciesId?: string }) {
  const { speciesId: routeId } = useParams()
  const speciesId = speciesIdProp ?? routeId
  const { db } = useStore()
  const { t, tr, locale, formatMoney } = useI18n()
  const [health, setHealth] = useState('all')

  const species = db.species.find((item) => item.id === speciesId)
  const classes = useMemo(
    () => db.marketClasses.filter((mc) => mc.speciesId === speciesId),
    [db.marketClasses, speciesId],
  )
  const visible = useMemo(() => filterByHealth(classes, health), [classes, health])
  const history = useMemo(() => averageHistory(visible), [visible])
  const trades = useMemo(() => tradesFor(visible), [visible])
  const options = useMemo(() => healthOptions(classes), [classes])

  if (!species) {
    return (
      <Page>
        <Crumbs>
          <Crumb to="/market/categories">← {t.charts.categories}</Crumb>
        </Crumbs>
        <Missing>{t.charts.categoryNotFound}</Missing>
      </Page>
    )
  }

  const grown = db.plants.filter((plant) => plant.speciesId === species.id && plant.status !== 'sold')
  const photo = classes[0]?.photo ?? grown.find((plant) => plant.photos[0])?.photos[0]
  const supply = classes.reduce((sum, mc) => sum + mc.supplyUnits, 0)
  const hasMarket = visible.length > 0
  const low = hasMarket ? Math.min(...visible.map((mc) => Math.min(mc.rangeMin, mc.lastPrice))) : 0
  const high = hasMarket ? Math.max(...visible.map((mc) => Math.max(mc.rangeMax, mc.lastPrice))) : 0
  const visibleSupply = visible.reduce((sum, mc) => sum + mc.supplyUnits, 0)
  const avgTrade = trades.length ? trades.reduce((sum, trade) => sum + trade.price, 0) / trades.length : 0

  return (
    <Page>
      <Crumbs aria-label={t.charts.categories}>
        <Crumb to="/market">{t.exchange.title}</Crumb>
        <span aria-hidden>›</span>
        <Crumb to="/market/categories">{t.charts.categories}</Crumb>
      </Crumbs>

      <Head>
        <Mark>
          <PlantImage src={photo} alt="" />
        </Mark>
        <div>
          <h1>{speciesName(species, locale)}</h1>
          <p>
            <Scientific>{species.scientificName}</Scientific> · {species.ticker}
          </p>
        </div>
      </Head>

      <Summary>
        <SummaryStat>
          <dt>{t.plant.growthTime}</dt>
          <dd>{tr(species.growthTime.en, species.growthTime.he)}</dd>
        </SummaryStat>
        <SummaryStat>
          <dt>{t.guide.inGreenhouses}</dt>
          <dd>{grown.reduce((sum, plant) => sum + plant.quantity, 0).toLocaleString()}</dd>
        </SummaryStat>
        <SummaryStat>
          <dt>{t.guide.onMarket}</dt>
          <dd>{supply.toLocaleString()}</dd>
        </SummaryStat>
        <SummaryStat>
          <dt>{t.charts.grades}</dt>
          <dd>{classes.length ? `${classes.length} ${t.charts.classes}` : '—'}</dd>
        </SummaryStat>
      </Summary>

      {classes.length === 0 ? (
        <WikiArticle species={species} />
      ) : (
        <>
          <HealthFilter options={options} value={health} onChange={setHealth} />

          <ChartPanel>
            <StockChart
              key={health}
              label={t.charts.categoryAverage}
              points={history}
              defaultRange="3M"
              extraStats={[
                { label: t.charts.marketRange, value: `${formatMoney(low)}–${formatMoney(high)}` },
                { label: t.exchange.supply, value: visibleSupply.toLocaleString() },
                { label: t.charts.avgPrice, value: avgTrade ? formatMoney(Math.round(avgTrade * 100) / 100) : '—' },
              ]}
            />
          </ChartPanel>

          <PriceRanges
            title={t.charts.ladderTitle}
            hint={t.charts.ladderHint}
            rows={visible.map((mc) => classRow(mc, locale))}
            grades={[...new Set(visible.map((mc) => mc.quality))].sort((a, b) => HEALTH_RANK[a] - HEALTH_RANK[b])}
          />

          <ChartPanel title={t.charts.transactions} hint={t.charts.transactionsHint}>
            <TradeChart trades={trades} />
          </ChartPanel>
          <TradeTable trades={trades} />
        </>
      )}
    </Page>
  )
}

export function CategoryPage({ speciesId }: { speciesId?: string } = {}) {
  useServerSlices(['users', 'plants', 'catalog'])
  const { t } = useI18n()

  return (
    <PageGate pageId="market" title={t.nav.market}>
      <FeatureGate placement="market.category" title={t.nav.market}>
        <CategoryReady speciesId={speciesId} />
      </FeatureGate>
    </PageGate>
  )
}
