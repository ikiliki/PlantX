import { useState, type ReactNode } from 'react'
import { HealthChip } from '../../../../components/HealthChip/HealthChip'
import { useI18n } from '../../../../i18n/I18nProvider'
import { priceScale, scaleExtent } from '../../chartScale'
import { healthTone } from '../../healthTone'
import {
  AxisRow,
  AxisTrack,
  Bar,
  Dot,
  GridLine,
  Head,
  Hint,
  Legend,
  LegendItem,
  Name,
  Root,
  RowBox,
  RowLink,
  Sheet,
  Sort,
  SortButton,
  Sub,
  Title,
  Track,
  Value,
} from './PriceRanges.styles'

export type RangeMark = { id: string; value: number; grade?: string; label: string }

export type RangeRow = {
  id: string
  label: string
  sub?: string
  grade?: string
  low: number
  high: number
  last?: number
  marks?: RangeMark[]
  href?: string
  highlight?: boolean
  classId?: string
  speciesId?: string
}

export function PriceRanges({
  rows,
  title,
  hint,
  grades = [],
}: {
  rows: RangeRow[]
  title: string
  hint?: string
  grades?: string[]
}) {
  const { t, formatMoney } = useI18n()
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')
  if (rows.length === 0) return null

  const key = (row: RangeRow) => row.last ?? row.low
  const sorted = [...rows].sort((a, b) => (order === 'asc' ? key(a) - key(b) : key(b) - key(a)))
  const values = rows.flatMap((row) => [row.low, row.high, ...(row.marks ?? []).map((m) => m.value)])
  const [lo, hi] = scaleExtent(values, 0.06)
  const scale = priceScale(Math.max(lo, 0.5), hi)
  const pct = (v: number) => `${(scale.at(v) * 100).toFixed(2)}%`
  const ticks = scale.ticks.length > 7 ? scale.ticks.filter((_, i) => i % 2 === 0) : scale.ticks

  const renderRow = (row: RangeRow, index: number): ReactNode => {
    const tone = healthTone(row.grade)
    const start = scale.at(row.low)
    const end = scale.at(row.high)
    const body = (
      <>
        <Name>
          <strong>{row.label}</strong>
          <Sub>
            {row.grade && <HealthChip health={row.grade} />}
            {row.sub}
          </Sub>
        </Name>
        <Track dir="ltr">
          {ticks.map((v) => (
            <GridLine key={v} style={{ left: pct(v) }} />
          ))}
          <Bar
            $index={index}
            style={{
              left: `${start * 100}%`,
              width: `${Math.max(0, end - start) * 100}%`,
              background: row.grade ? tone.soft : 'rgba(93, 124, 78, 0.18)',
              boxShadow: `inset 0 0 0 1px ${row.grade ? tone.strong : 'rgba(93, 124, 78, 0.4)'}33`,
            }}
            title={`${formatMoney(row.low)} – ${formatMoney(row.high)}`}
          />
          {(row.marks ?? []).map((mark) => (
            <Dot
              key={mark.id}
              $index={index}
              $size={9}
              style={{ left: pct(mark.value), background: healthTone(mark.grade).strong }}
              title={`${mark.label} · ${formatMoney(mark.value)}`}
            />
          ))}
          {row.last != null && (
            <Dot
              $index={index}
              $size={12}
              style={{ left: pct(row.last), background: tone.strong }}
              title={formatMoney(row.last)}
            />
          )}
        </Track>
        <Value>
          <strong>{row.last != null ? formatMoney(row.last) : formatMoney(row.low)}</strong>
          <small>
            {row.last != null
              ? `${formatMoney(row.low)}–${formatMoney(row.high)}`
              : `→ ${formatMoney(row.high)}`}
          </small>
        </Value>
      </>
    )
    return row.href ? (
      <RowLink key={row.id} to={row.href} $highlight={row.highlight}>
        {body}
      </RowLink>
    ) : (
      <RowBox key={row.id} $highlight={row.highlight}>
        {body}
      </RowBox>
    )
  }

  return (
    <Root>
      <Head>
        <div>
          <Title>{title}</Title>
          {hint && <Hint>{hint}</Hint>}
        </div>
        <Sort role="group" aria-label={t.charts.sortLabel}>
          <SortButton type="button" $on={order === 'asc'} aria-pressed={order === 'asc'} onClick={() => setOrder('asc')}>
            {t.charts.lowToHigh}
          </SortButton>
          <SortButton type="button" $on={order === 'desc'} aria-pressed={order === 'desc'} onClick={() => setOrder('desc')}>
            {t.charts.highToLow}
          </SortButton>
        </Sort>
      </Head>
      <Sheet>
        <AxisRow aria-hidden>
          <span />
          <AxisTrack dir="ltr" data-track>
            {ticks.map((v) => (
              <span key={v} style={{ left: pct(v) }}>
                {formatMoney(v)}
              </span>
            ))}
          </AxisTrack>
          <span />
        </AxisRow>
        {sorted.map(renderRow)}
      </Sheet>
      {(grades.length > 0 || scale.log) && (
        <Legend>
          {grades.map((grade) => (
            <LegendItem key={grade}>
              <i style={{ background: healthTone(grade).strong }} />
              {t.market.filterGrade} {grade}
            </LegendItem>
          ))}
          {scale.log && <LegendItem>{t.charts.logScale}</LegendItem>}
        </Legend>
      )}
    </Root>
  )
}
