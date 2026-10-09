import { useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { Button } from '../../components/Button/Button'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { PageGate } from '../../components/PageGate/PageGate'
import { useAuth } from '../../features/auth/AuthProvider'
import { className, speciesName } from '../../features/market/categoryData'
import { ChartPanel } from '../../features/market/components/ChartPanel/ChartPanel'
import { MarketListingsPanel } from '../../features/market/components/MarketListingsPanel/MarketListingsPanel'
import { StockChart } from '../../features/market/components/StockChart/StockChart'
import { emptyMarketFilters } from '../../features/market/marketFilters'
import { listingsForClass, plantsForClass } from '../../features/market/classLots'
import { PlantPassport } from '../../features/greenhouse/components/PlantPassport/PlantPassport'
import { useI18n } from '../../i18n/I18nProvider'
import { speciesHref } from '../../features/species/components/GuideLink/GuideLink'
import { classHistory } from '../../mock/marketHistory'
import { maskedChange, maskedPrice, maskedQty } from '../../features/market/maskedQuote'
import { useStore } from '../../mock/store'
import { useServerSlices } from '../../mock/useServerSlices'
import { placementRelease } from '../../theme/release'
import {
  Back,
  Blurred,
  BlurredText,
  BookBlock,
  Change,
  Crumbs,
  Desk,
  HeadRow,
  Notice,
  Page,
  ProfileCard,
  Row,
  Sheet,
  Side,
  SideColumn,
  SideStats,
  Stat,
  Tab,
  Tabs,
  Ticket,
  TicketLabel,
  TicketValue,
  ChartTabBody,
} from './MarketClassPage.styles'

type Panel = 'chart' | 'book'

function MarketClassReady({ classId }: { classId?: string }) {
  const { id: routeId } = useParams()
  const id = classId ?? routeId
  const location = useLocation()
  const { db, purchaseClass, signedIn } = useStore()
  const { openAuth } = useAuth()
  const { t, formatMoney, locale } = useI18n()
  const [notice, setNotice] = useState('')
  const [panel, setPanel] = useState<Panel>('chart')
  const mc = db.marketClasses.find((item) => item.id === id)
  const history = useMemo(() => (mc ? classHistory(mc) : []), [mc])
  const classListings = useMemo(() => (mc ? listingsForClass(db, mc.id) : []), [db, mc])
  const selectedListingId = useMemo(() => {
    const picked = (location.state as { listingId?: string } | null)?.listingId
    if (picked && classListings.some((listing) => listing.id === picked)) return picked
    return classListings[0]?.id
  }, [location.state, classListings])
  const profilePlantId = useMemo(() => {
    const listing = classListings.find((item) => item.id === selectedListingId)
    if (listing) return listing.plantId
    if (!mc) return null
    return plantsForClass(db, mc.id)[0]?.id ?? null
  }, [classListings, selectedListingId, db, mc])

  if (!mc) return <p>{t.passport.notFound}</p>

  const buy = () => {
    const run = () => {
      const orderId = purchaseClass(mc.id)
      setNotice(orderId ? `${t.market.intentRecorded} (${orderId})` : t.market.empty)
    }
    if (!signedIn) openAuth('buy', run)
    else run()
  }

  const value = mc.lastPrice * Math.max(mc.supplyUnits, 1)
  const up = mc.changePct >= 0
  const species = db.species.find((item) => item.id === mc.speciesId)
  const categoryFilters = emptyMarketFilters(mc.speciesId)

  return (
    <Page>
      <Crumbs>
        <Back to="/market">← {t.exchange.title}</Back>
        {species && (
          <>
            <span aria-hidden>›</span>
            <Back to={speciesHref(species.id, 'market')}>{speciesName(species, locale)}</Back>
          </>
        )}
      </Crumbs>

      <Desk>
        <ProfileCard>
          {profilePlantId ? (
            <PlantPassport plantId={profilePlantId} embedded />
          ) : (
            <EmptyState title={t.passport.notFound} />
          )}
        </ProfileCard>

        <SideColumn>
          <Ticket>
            <TicketLabel>{t.market.buy}</TicketLabel>
            <TicketLabel>{t.exchange.perUnit}</TicketLabel>
            <TicketValue>
              {formatMoney(mc.lastPrice)}
              <span>{mc.code}</span>
            </TicketValue>
            <TicketLabel>{t.market.quantity}</TicketLabel>
            <TicketValue>
              1<span>{t.market.unitPlant}</span>
            </TicketValue>
            <Button type="button" block onClick={buy}>
              {t.market.buy}
            </Button>
            {notice && <Notice>{notice}</Notice>}
          </Ticket>

          <SideStats>
            <Stat>
              <dt>{t.exchange.portfolio}</dt>
              <dd>{formatMoney(value)}</dd>
            </Stat>
            <Stat>
              <dt>{t.exchange.supply}</dt>
              <dd>{mc.supplyUnits.toLocaleString()}</dd>
            </Stat>
            <Stat>
              <dt>{t.exchange.demand}</dt>
              <dd>{mc.demandUnits.toLocaleString()}</dd>
            </Stat>
            <Stat>
              <dt>{t.exchange.bids}</dt>
              <dd>×{mc.bidQty}</dd>
            </Stat>
            <Stat>
              <dt>{t.exchange.asks}</dt>
              <dd>×{mc.askQty}</dd>
            </Stat>
            <Stat>
              <dt>{t.market.change}</dt>
              <dd>
                <Change $up={up}>
                  {up ? '+' : '−'}
                  {Math.abs(mc.changePct).toFixed(1)}%
                </Change>
              </dd>
            </Stat>
          </SideStats>
        </SideColumn>
      </Desk>

      <BookBlock>
        <Tabs>
          <Tab type="button" $on={panel === 'chart'} onClick={() => setPanel('chart')}>
            {t.nav.charts}
          </Tab>
          <Tab type="button" $on={panel === 'book'} onClick={() => setPanel('book')}>
            {t.exchange.orderBook}
          </Tab>
        </Tabs>

        {panel === 'chart' && (
          <ChartTabBody>
            <ChartPanel hint={t.exchange.chartNote}>
              {history.length >= 2 ? (
                <StockChart
                  key={mc.id}
                  label={className(mc, locale)}
                  points={history}
                  defaultRange="3M"
                  height={280}
                  extraStats={[
                    {
                      label: t.charts.marketRange,
                      value: `${formatMoney(Math.min(mc.rangeMin, mc.lastPrice))}–${formatMoney(Math.max(mc.rangeMax, mc.lastPrice))}`,
                    },
                    { label: t.exchange.supply, value: mc.supplyUnits.toLocaleString() },
                    { label: t.exchange.demand, value: mc.demandUnits.toLocaleString() },
                  ]}
                />
              ) : (
                <EmptyState icon="chart" title={t.charts.noTrades} />
              )}
            </ChartPanel>
          </ChartTabBody>
        )}

        {panel === 'book' && (
          <Sheet>
            <HeadRow>
              <span>{t.market.seller}</span>
              <span>{t.common.status}</span>
              <span>{t.market.quantity}</span>
              <span>{t.market.price}</span>
            </HeadRow>
            {mc.asks.map((row, index) => (
              <Row key={`ask-${index}`}>
                <span>{locale === 'he' ? row.sellerLabelHe : row.sellerLabel}</span>
                <Side>{t.exchange.asks}</Side>
                <span>×{row.qty}</span>
                <strong>{formatMoney(row.price)}</strong>
              </Row>
            ))}
            {mc.bids.map((row, index) => (
              <Row key={`bid-${index}`}>
                <span>{locale === 'he' ? row.buyerLabelHe : row.buyerLabel}</span>
                <Side $bid>{t.exchange.bids}</Side>
                <span>×{row.qty}</span>
                <strong>{formatMoney(row.price)}</strong>
              </Row>
            ))}
          </Sheet>
        )}
      </BookBlock>

      <MarketListingsPanel filters={categoryFilters} title={t.charts.inCategory} selectedId={selectedListingId} />
    </Page>
  )
}

function MarketClassPending({ classId }: { classId?: string }) {
  const { id: routeId } = useParams()
  const id = classId ?? routeId
  const { db } = useStore()
  const { t, locale, formatMoney } = useI18n()
  const [panel, setPanel] = useState<Panel>('chart')
  const mc = db.marketClasses.find((item) => item.id === id)
  const history = useMemo(() => {
    if (!mc) return []
    return classHistory({
      ...mc,
      lastPrice: maskedPrice(mc.id),
      changePct: maskedChange(mc.id),
    })
  }, [mc])
  const classListings = useMemo(() => (mc ? listingsForClass(db, mc.id) : []), [db, mc])
  const profilePlantId = useMemo(() => {
    if (!mc) return null
    return plantsForClass(db, mc.id)[0]?.id ?? classListings[0]?.plantId ?? null
  }, [classListings, db, mc])
  if (!mc) return <p>{t.passport.notFound}</p>

  const species = db.species.find((item) => item.id === mc.speciesId)

  return (
    <Page>
      <Crumbs>
        <Back to="/market">← {t.exchange.title}</Back>
        {species && (
          <>
            <span aria-hidden>›</span>
            <Back to={speciesHref(species.id, 'market')}>{speciesName(species, locale)}</Back>
          </>
        )}
      </Crumbs>

      <Desk>
        <ProfileCard>
          {profilePlantId ? (
            <PlantPassport plantId={profilePlantId} embedded />
          ) : (
            <EmptyState title={t.passport.notFound} />
          )}
        </ProfileCard>

        <SideColumn>
          <Ticket>
            <TicketLabel>{t.market.buy}</TicketLabel>
            <TicketValue>
              <BlurredText>{formatMoney(maskedPrice(mc.id))}</BlurredText>
              <span>{mc.code}</span>
            </TicketValue>
          </Ticket>
        </SideColumn>
      </Desk>

      <BookBlock>
        <Tabs>
          <Tab type="button" $on={panel === 'chart'} onClick={() => setPanel('chart')}>
            {t.nav.charts}
          </Tab>
          <Tab type="button" $on={panel === 'book'} onClick={() => setPanel('book')}>
            {t.exchange.orderBook}
          </Tab>
        </Tabs>
        {panel === 'chart' ? (
          <ChartTabBody>
            <Blurred>
              <ChartPanel hint={t.exchange.chartNote}>
                {history.length >= 2 ? (
                  <StockChart
                    key={mc.id}
                    label={className(mc, locale)}
                    points={history}
                    defaultRange="3M"
                    height={280}
                  />
                ) : (
                  <EmptyState icon="chart" title={t.charts.noTrades} />
                )}
              </ChartPanel>
            </Blurred>
          </ChartTabBody>
        ) : (
          <Sheet>
            <HeadRow>
              <span>{t.market.seller}</span>
              <span>{t.common.status}</span>
              <span>{t.market.quantity}</span>
              <span>{t.market.price}</span>
            </HeadRow>
            {mc.asks.map((row, index) => (
              <Row key={`ask-${index}`} $blur>
                <span>{locale === 'he' ? row.sellerLabelHe : row.sellerLabel}</span>
                <Side>{t.exchange.asks}</Side>
                <span>×{maskedQty(`${mc.id}-ask-${index}`)}</span>
                <strong>{formatMoney(maskedPrice(`${mc.id}-ask-${index}`))}</strong>
              </Row>
            ))}
            {mc.bids.map((row, index) => (
              <Row key={`bid-${index}`} $blur>
                <span>{locale === 'he' ? row.buyerLabelHe : row.buyerLabel}</span>
                <Side $bid>{t.exchange.bids}</Side>
                <span>×{maskedQty(`${mc.id}-bid-${index}`)}</span>
                <strong>{formatMoney(maskedPrice(`${mc.id}-bid-${index}`))}</strong>
              </Row>
            ))}
          </Sheet>
        )}
      </BookBlock>
    </Page>
  )
}

export function MarketClassPage({ classId }: { classId?: string } = {}) {
  useServerSlices(['users', 'plants', 'catalog'])
  const { t } = useI18n()
  const { db } = useStore()
  const release = placementRelease(db.system, 'market.class')

  return (
    <PageGate pageId="market" title={t.nav.market}>
      {release.enabled && release.status === 'ready' ? (
        <MarketClassReady classId={classId} />
      ) : release.enabled ? (
        <MarketClassPending classId={classId} />
      ) : null}
    </PageGate>
  )
}
