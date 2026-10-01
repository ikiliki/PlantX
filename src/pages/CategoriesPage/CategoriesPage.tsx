import { useMemo, useState } from 'react'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { FeatureGate } from '../../components/FeatureGate/FeatureGate'
import { PageGate } from '../../components/PageGate/PageGate'
import {
  categoryGroups,
  categoryRow,
  filterByGrade,
  gradeOptions,
  tradesFor,
} from '../../features/market/categoryData'
import { ChartPanel } from '../../features/market/components/ChartPanel/ChartPanel'
import { GradeFilter } from '../../features/market/components/GradeFilter/GradeFilter'
import { PriceRanges } from '../../features/market/components/PriceRanges/PriceRanges'
import { TradeChart } from '../../features/market/components/TradeChart/TradeChart'
import { TradeTable } from '../../features/market/components/TradeTable/TradeTable'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import { useServerSlices } from '../../mock/useServerSlices'
import { Back, Header, Page, Summary, SummaryItem, Toolbar } from './CategoriesPage.styles'

function CategoriesReady() {
  const { db } = useStore()
  const { t, locale, formatMoney } = useI18n()
  const [grade, setGrade] = useState('all')

  const groups = useMemo(() => categoryGroups(db), [db])
  const options = useMemo(() => gradeOptions(groups.flatMap((group) => group.classes)), [groups])
  const visible = useMemo(
    () =>
      groups
        .map((group) => ({ ...group, classes: filterByGrade(group.classes, grade) }))
        .filter((group) => group.classes.length > 0),
    [groups, grade],
  )
  const classes = useMemo(() => visible.flatMap((group) => group.classes), [visible])
  const trades = useMemo(() => tradesFor(classes), [classes])
  const rows = visible.map((group) => categoryRow(group, locale, t.charts.classes))

  return (
    <Page>
      <Back to="/market">← {t.exchange.title}</Back>
      <Header>
        <h1>{t.charts.categoriesTitle}</h1>
        <p>{t.charts.categoriesSubtitle}</p>
      </Header>

      {groups.length === 0 ? (
        <EmptyState title={t.market.empty} />
      ) : (
        <>
          <Summary>
            <SummaryItem>
              <dt>{t.charts.categories}</dt>
              <dd>{visible.length}</dd>
            </SummaryItem>
            <SummaryItem>
              <dt>{t.charts.classes}</dt>
              <dd>{classes.length}</dd>
            </SummaryItem>
            <SummaryItem>
              <dt>{t.charts.transactions}</dt>
              <dd>{trades.length}</dd>
            </SummaryItem>
            <SummaryItem>
              <dt>{t.charts.low}</dt>
              <dd>{rows.length ? formatMoney(Math.min(...rows.map((row) => row.low))) : '—'}</dd>
            </SummaryItem>
            <SummaryItem>
              <dt>{t.charts.high}</dt>
              <dd>{rows.length ? formatMoney(Math.max(...rows.map((row) => row.high))) : '—'}</dd>
            </SummaryItem>
          </Summary>

          <Toolbar>
            <GradeFilter options={options} value={grade} onChange={setGrade} />
          </Toolbar>

          <PriceRanges
            title={t.charts.categories}
            hint={t.charts.categoryLadderHint}
            rows={rows}
            grades={options.map((option) => option.grade)}
          />

          <ChartPanel title={t.charts.transactions} hint={t.charts.transactionsHint}>
            <TradeChart trades={trades} height={300} />
          </ChartPanel>
          <TradeTable trades={trades} />
        </>
      )}
    </Page>
  )
}

export function CategoriesPage() {
  useServerSlices(['users', 'plants', 'catalog'])
  const { t } = useI18n()

  return (
    <PageGate pageId="market" title={t.nav.market}>
      <FeatureGate placement="market.categories" title={t.nav.market}>
        <CategoriesReady />
      </FeatureGate>
    </PageGate>
  )
}
