import { useMemo } from 'react'
import { FeatureGate } from '../../../../components/FeatureGate/FeatureGate'
import { MarketGlance } from '../../../market/components/MarketGlance/MarketGlance'
import { MarketPending } from '../../../market/components/MarketPending/MarketPending'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { MockDb, TradeScenario } from '../../../../mock/types'
import {
  Blotter,
  Cell,
  EmptyNote,
  GlanceSlot,
  RowCell,
  SaleLink,
  Subhead,
  Table,
} from './MarketRail.styles'

type SaleRow = {
  id: string
  title: string
  price: number
  date: string
  href: string
}

function formatSaleDate(iso: string, locale: string) {
  const date = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

function classHref(db: MockDb, plantId?: string, listingId?: string) {
  const listing = listingId ? db.listings.find((item) => item.id === listingId) : undefined
  const plant = db.plants.find((item) => item.id === (plantId ?? listing?.plantId))
  const classId = listing?.marketClassId ?? plant?.marketClassId
  return classId ? `/market/${classId}` : '/market'
}

function latestSales(db: MockDb, locale: 'he' | 'en'): SaleRow[] {
  const fromOrders = db.orders.flatMap((order) =>
    order.items.map((item, index) => ({
      id: `${order.id}-${index}`,
      title: locale === 'he' ? item.titleHe : item.title,
      price: item.unitPrice,
      date: order.completedAt ?? order.createdAt,
      href: classHref(db, item.plantId, order.listingId),
    })),
  )

  const fromComps = db.plants.flatMap((plant) =>
    (plant.comps ?? []).map((comp, index) => ({
      id: `${plant.id}-comp-${index}`,
      title: locale === 'he' ? comp.noteHe || plant.titleHe : comp.note || plant.title,
      price: comp.price,
      date: comp.date,
      href: classHref(db, plant.id),
    })),
  )

  return [...fromOrders, ...fromComps].sort((a, b) => b.date.localeCompare(a.date))
}

function takeTrades(rows: SaleRow[], scenario: TradeScenario): SaleRow[] {
  if (scenario === 'none') return []
  if (scenario === 'one') return rows.slice(0, 1)
  return rows.slice(0, 5)
}

export function MarketRail() {
  const { t, locale, formatMoney } = useI18n()
  const { db } = useStore()

  const sales = useMemo(
    () => takeTrades(latestSales(db, locale), db.flags.trades),
    [db, locale],
  )

  return (
    <FeatureGate placement="home.market" title={t.nav.market} pending={<MarketPending view="widget" />}>
      <Blotter>
        <GlanceSlot>
          <MarketGlance embedded />
        </GlanceSlot>
        <Subhead>{t.feed.latestSales}</Subhead>
        {sales.length === 0 ? (
          <EmptyNote>{t.feed.noSales}</EmptyNote>
        ) : (
          <Table>
            <thead>
              <tr>
                <Cell scope="col">{t.feed.sale}</Cell>
                <Cell scope="col">{t.market.price}</Cell>
                <Cell scope="col">{t.feed.when}</Cell>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <RowCell>
                    <SaleLink to={sale.href}>{sale.title}</SaleLink>
                  </RowCell>
                  <RowCell>{formatMoney(sale.price)}</RowCell>
                  <RowCell>
                    <time dateTime={sale.date}>{formatSaleDate(sale.date, locale)}</time>
                  </RowCell>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Blotter>
    </FeatureGate>
  )
}
