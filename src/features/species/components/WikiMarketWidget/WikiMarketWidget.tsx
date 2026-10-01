import { MarketGlance } from '../../../market/components/MarketGlance/MarketGlance'
import { ListedPlants } from '../ListedPlants/ListedPlants'
import { speciesHref } from '../GuideLink/GuideLink'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { isPlacementReady } from '../../../../theme/release'
import { Empty, Expand, Head, Panel, Stat, Stats, Title } from './WikiMarketWidget.styles'

export function WikiMarketWidget({ speciesId, compact }: { speciesId?: string; compact?: boolean }) {
  const { db } = useStore()
  const { t, formatMoney } = useI18n()
  if (!isPlacementReady(db.system, 'market.board')) return null
  const species = speciesId ? db.species.find((item) => item.id === speciesId) : undefined
  const classes = db.marketClasses.filter((item) => !speciesId || item.speciesId === speciesId)
  const listed = db.listings.filter((listing) => {
    if (listing.status !== 'active') return false
    if (!speciesId) return true
    const plant = db.plants.find((item) => item.id === listing.plantId)
    return plant?.speciesId === speciesId
  })
  const expandTo = species ? speciesHref(species.id, 'market') : '/market'
  const low = classes.length ? Math.min(...classes.map((item) => Math.min(item.rangeMin, item.lastPrice))) : 0
  const high = classes.length ? Math.max(...classes.map((item) => Math.max(item.rangeMax, item.lastPrice))) : 0
  const last = classes[0]

  return (
    <Panel aria-label={t.guide.marketTitle}>
      <Head>
        <Title>{t.guide.marketTitle}</Title>
        <Expand to={expandTo}>{t.market.expand}</Expand>
      </Head>
      {classes.length === 0 && listed.length === 0 ? (
        <Empty>{t.guide.noMarket}</Empty>
      ) : species ? (
        <>
          <Stats>
            <Stat>
              <dt>{t.market.price}</dt>
              <dd>{last ? formatMoney(last.lastPrice) : '—'}</dd>
            </Stat>
            <Stat>
              <dt>{t.exchange.range}</dt>
              <dd>{classes.length ? `${formatMoney(low)}–${formatMoney(high)}` : '—'}</dd>
            </Stat>
            <Stat>
              <dt>{t.guide.listed}</dt>
              <dd>×{listed.length}</dd>
            </Stat>
          </Stats>
          {!compact && <ListedPlants speciesId={species.id} />}
        </>
      ) : (
        <>
          <MarketGlance embedded />
        </>
      )}
    </Panel>
  )
}
