import { useId, useMemo, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { PricePoint } from '../../../../mock/marketHistory'
import { theme } from '../../../../theme/tokens'
import {
  CHART_RANGES,
  evenIndices,
  formatCompact,
  formatDay,
  niceTicks,
  paddedExtent,
  useElementWidth,
  type ChartRange,
} from '../../chartScale'
import {
  Delta,
  Headline,
  Label,
  Plot,
  Price,
  RangeButton,
  Ranges,
  Root,
  StatItem,
  StatsGrid,
  Svg,
  Tooltip,
  Top,
} from './StockChart.styles'

const PAD = { top: 22, right: 62, bottom: 26, left: 4 }
const TOOLTIP_W = 140

export type ExtraStat = { label: string; value: string }

export function StockChart({
  points,
  label,
  height = 320,
  defaultRange = '1M',
  extraStats = [],
}: {
  points: PricePoint[]
  label?: string
  height?: number
  defaultRange?: ChartRange
  extraStats?: ExtraStat[]
}) {
  const { t, locale, formatMoney } = useI18n()
  const [range, setRange] = useState<ChartRange>(defaultRange)
  const [hover, setHover] = useState<number | null>(null)
  const [plotRef, width] = useElementWidth<HTMLDivElement>()
  const gradientId = useId()

  const days = CHART_RANGES.find((item) => item.id === range)?.days ?? 30
  const series = useMemo(() => points.slice(-(days + 1)), [points, days])
  const year = useMemo(() => points.slice(-366).map((p) => p.price), [points])
  if (series.length < 2) return null

  const n = series.length
  const first = series[0]
  const last = series[n - 1]
  const prices = series.map((p) => p.price)
  let highIndex = 0
  let lowIndex = 0
  prices.forEach((p, i) => {
    if (p > prices[highIndex]) highIndex = i
    if (p < prices[lowIndex]) lowIndex = i
  })
  const high = prices[highIndex]
  const low = prices[lowIndex]
  const up = last.price >= first.price
  const tone = up ? theme.colors.up : theme.colors.down
  const avgVolume = series.reduce((sum, p) => sum + p.volume, 0) / n

  const active = hover == null ? null : series[Math.min(hover, n - 1)]
  const shown = active ?? last
  const delta = shown.price - first.price
  const deltaPct = (delta / first.price) * 100
  const deltaUp = delta >= 0

  const plotW = Math.max(0, width - PAD.left - PAD.right)
  const plotH = height - PAD.top - PAD.bottom
  const priceH = plotH * 0.8
  const priceBottom = PAD.top + priceH
  const volTop = priceBottom + 8
  const volH = Math.max(0, plotH - priceH - 8)
  const [yMin, yMax] = paddedExtent(prices, 0.14)
  const yTicks = niceTicks(yMin, yMax, 4).filter((v) => v >= yMin && v <= yMax)
  const x = (i: number) => PAD.left + (i / (n - 1)) * plotW
  const y = (p: number) => PAD.top + (1 - (p - yMin) / (yMax - yMin || 1)) * priceH
  const maxVolume = Math.max(1, ...series.map((p) => p.volume))
  const barW = Math.max(1, (plotW / n) * 0.62)

  const line = series.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.price).toFixed(1)}`).join('')
  const area = `${line}L${x(n - 1).toFixed(1)},${priceBottom}L${x(0).toFixed(1)},${priceBottom}Z`
  const xTicks = evenIndices(n, width < 520 ? 3 : 5)
  const dateStyle = days > 100 ? 'axis-long' : 'axis-short'

  const anchorFor = (px: number) => (px < PAD.left + 40 ? 'start' : px > PAD.left + plotW - 40 ? 'end' : 'middle')

  const indexAt = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = (event.clientX - rect.left - PAD.left) / (plotW || 1)
    return Math.min(n - 1, Math.max(0, Math.round(ratio * (n - 1))))
  }

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = hover ?? n - 1
    const next =
      event.key === 'ArrowLeft'
        ? current - 1
        : event.key === 'ArrowRight'
          ? current + 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? n - 1
              : null
    if (event.key === 'Escape') setHover(null)
    if (next == null) return
    event.preventDefault()
    setHover(Math.min(n - 1, Math.max(0, next)))
  }

  const summary = `${label ?? t.charts.priceChart}: ${formatMoney(first.price)} → ${formatMoney(last.price)}, ${t.charts.high} ${formatMoney(high)}, ${t.charts.low} ${formatMoney(low)}`
  const hoverX = hover == null ? 0 : x(hover)
  const tooltipLeft = Math.min(Math.max(hoverX - TOOLTIP_W / 2, 0), Math.max(0, width - TOOLTIP_W))

  return (
    <Root>
      <Top>
        <Headline>
          {label && <Label>{label}</Label>}
          <Price>{formatMoney(shown.price)}</Price>
          <Delta $up={deltaUp}>
            {deltaUp ? '+' : '−'}
            {formatMoney(Math.abs(Math.round(delta * 100) / 100))} ({deltaUp ? '+' : '−'}
            {Math.abs(deltaPct).toFixed(2)}%) {deltaUp ? '▲' : '▼'}
            <span>{active ? formatDay(active.t, locale, 'full') : t.charts.rangeCaption[range]}</span>
          </Delta>
        </Headline>
        <Ranges role="group" aria-label={t.charts.rangeLabel}>
          {CHART_RANGES.map((item) => (
            <RangeButton
              key={item.id}
              type="button"
              $on={item.id === range}
              aria-pressed={item.id === range}
              onClick={() => {
                setRange(item.id)
                setHover(null)
              }}
            >
              {t.charts.range[item.id]}
            </RangeButton>
          ))}
        </Ranges>
      </Top>

      <Plot
        ref={plotRef}
        $height={height}
        dir="ltr"
        tabIndex={0}
        role="img"
        aria-label={summary}
        data-chart-plot
        onPointerMove={(event) => setHover(indexAt(event))}
        onPointerDown={(event) => setHover(indexAt(event))}
        onPointerLeave={() => setHover(null)}
        onKeyDown={onKey}
        onBlur={() => setHover(null)}
      >
        {width > 0 && (
          <Svg viewBox={`0 0 ${width} ${height}`} aria-hidden>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={tone} stopOpacity="0.22" />
                <stop offset="100%" stopColor={tone} stopOpacity="0" />
              </linearGradient>
            </defs>

            {yTicks.map((v) => (
              <g key={v}>
                <line
                  x1={PAD.left}
                  x2={PAD.left + plotW}
                  y1={y(v)}
                  y2={y(v)}
                  stroke={theme.colors.border}
                  strokeDasharray="2 4"
                />
                <text x={PAD.left + plotW + 10} y={y(v) + 4}>
                  {formatMoney(v)}
                </text>
              </g>
            ))}
            {xTicks.map((i) => (
              <g key={i}>
                <line x1={x(i)} x2={x(i)} y1={PAD.top} y2={volTop + volH} stroke={theme.colors.border} strokeOpacity="0.55" />
                <text x={x(i)} y={height - 6} textAnchor={anchorFor(x(i))}>
                  {formatDay(series[i].t, locale, dateStyle)}
                </text>
              </g>
            ))}
            <line x1={PAD.left} x2={PAD.left + plotW} y1={priceBottom} y2={priceBottom} stroke={theme.colors.border} />

            <g className="marks" key={`vol-${range}`}>
              {series.map((p, i) => {
                const h = (p.volume / maxVolume) * volH
                return (
                  <rect
                    key={p.t}
                    x={x(i) - barW / 2}
                    y={volTop + volH - h}
                    width={barW}
                    height={h}
                    rx={Math.min(1.5, barW / 2)}
                    fill={hover === i ? tone : theme.colors.moss}
                    fillOpacity={hover === i ? 0.7 : 0.28}
                  />
                )
              })}
            </g>

            <line
              x1={PAD.left}
              x2={PAD.left + plotW}
              y1={y(first.price)}
              y2={y(first.price)}
              stroke={theme.colors.muted}
              strokeOpacity="0.6"
              strokeDasharray="1 3"
            />

            <path key={`area-${range}`} className="area" d={area} fill={`url(#${gradientId})`} />
            <path
              key={`line-${range}`}
              className="line"
              d={line}
              fill="none"
              stroke={tone}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1"
            />

            <g className="marks" key={`hl-${range}`}>
              <circle cx={x(highIndex)} cy={y(high)} r="3.5" fill={theme.colors.creamCard} stroke={tone} strokeWidth="2" />
              <text x={x(highIndex)} y={y(high) - 9} textAnchor={anchorFor(x(highIndex))} fontWeight="700">
                {t.charts.high} {formatMoney(high)}
              </text>
              <circle cx={x(lowIndex)} cy={y(low)} r="3.5" fill={theme.colors.creamCard} stroke={tone} strokeWidth="2" />
              <text x={x(lowIndex)} y={y(low) + 18} textAnchor={anchorFor(x(lowIndex))} fontWeight="700">
                {t.charts.low} {formatMoney(low)}
              </text>
            </g>

            {active && hover != null && (
              <g>
                <line x1={hoverX} x2={hoverX} y1={PAD.top} y2={volTop + volH} stroke={theme.colors.ink} strokeOpacity="0.35" />
                <circle cx={hoverX} cy={y(active.price)} r="5" fill={tone} stroke={theme.colors.creamCard} strokeWidth="2" />
              </g>
            )}
          </Svg>
        )}
        {active && (
          <Tooltip style={{ left: tooltipLeft, width: TOOLTIP_W }} aria-live="polite">
            <span>{formatDay(active.t, locale, 'full')}</span>
            <strong>{formatMoney(active.price)}</strong>
            <span>
              {t.charts.volume} {formatCompact(active.volume, locale)}
            </span>
          </Tooltip>
        )}
      </Plot>

      <StatsGrid aria-label={t.charts.keyStats}>
        <StatItem>
          <dt>{t.charts.open}</dt>
          <dd>{formatMoney(first.price)}</dd>
        </StatItem>
        <StatItem>
          <dt>{t.charts.high}</dt>
          <dd>{formatMoney(high)}</dd>
        </StatItem>
        <StatItem>
          <dt>{t.charts.low}</dt>
          <dd>{formatMoney(low)}</dd>
        </StatItem>
        <StatItem>
          <dt>{t.charts.close}</dt>
          <dd>{formatMoney(last.price)}</dd>
        </StatItem>
        <StatItem>
          <dt>{t.charts.yearHigh}</dt>
          <dd>{formatMoney(Math.max(...year))}</dd>
        </StatItem>
        <StatItem>
          <dt>{t.charts.yearLow}</dt>
          <dd>{formatMoney(Math.min(...year))}</dd>
        </StatItem>
        <StatItem>
          <dt>{t.charts.avgVolume}</dt>
          <dd>{formatCompact(Math.round(avgVolume), locale)}</dd>
        </StatItem>
        {extraStats.map((stat) => (
          <StatItem key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
          </StatItem>
        ))}
      </StatsGrid>
    </Root>
  )
}
