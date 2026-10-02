import { useMemo, useState, type PointerEvent } from 'react'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { MarketTrade } from '../../../../mock/marketHistory'
import { theme } from '../../../../theme/tokens'
import { evenIndices, formatDay, priceScale, scaleExtent, useElementWidth } from '../../chartScale'
import { healthTone } from '../../healthTone'
import { Empty, Plot, Svg, Tooltip } from './TradeChart.styles'

const PAD = { top: 12, right: 62, bottom: 26, left: 6 }
const HIT_RADIUS = 18
const DAY_MS = 86_400_000

export type ChartTrade = MarketTrade & { label: string }

function dayMs(iso: string) {
  return new Date(`${iso}T12:00:00`).getTime()
}

export function TradeChart({ trades, height = 280 }: { trades: ChartTrade[]; height?: number }) {
  const { t, locale, formatMoney, tr } = useI18n()
  const [plotRef, width] = useElementWidth<HTMLDivElement>()
  const [hoverId, setHoverId] = useState<string | null>(null)

  const geometry = useMemo(() => {
    if (trades.length === 0) return null
    const times = trades.map((trade) => dayMs(trade.at))
    const start = Math.min(...times)
    const end = Math.max(...times, start + DAY_MS)
    const [lo, hi] = scaleExtent(
      trades.map((trade) => trade.price),
      0.12,
    )
    const scale = priceScale(Math.max(lo, 0.5), hi)
    return { start, end, scale }
  }, [trades])

  if (!geometry) {
    return (
      <Plot ref={plotRef} $height={height}>
        <Empty>{t.charts.noTrades}</Empty>
      </Plot>
    )
  }

  const plotW = Math.max(0, width - PAD.left - PAD.right)
  const plotH = height - PAD.top - PAD.bottom
  const x = (iso: string) => PAD.left + ((dayMs(iso) - geometry.start) / (geometry.end - geometry.start)) * plotW
  const y = (price: number) => PAD.top + (1 - geometry.scale.at(price)) * plotH
  const radius = (qty: number) => Math.min(11, 3 + Math.sqrt(qty) * 1.2)
  const yTicks = geometry.scale.ticks.length > 6 ? geometry.scale.ticks.filter((_, i) => i % 2 === 0) : geometry.scale.ticks
  const spanDays = Math.round((geometry.end - geometry.start) / DAY_MS)
  const xTicks = evenIndices(spanDays + 1, width < 520 ? 3 : 5).map((offset) =>
    new Date(geometry.start + offset * DAY_MS).toISOString().slice(0, 10),
  )
  const ordered = [...trades].sort((a, b) => b.qty - a.qty)
  const hovered = trades.find((trade) => trade.id === hoverId) ?? null

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const px = event.clientX - rect.left
    const py = event.clientY - rect.top
    let best: string | null = null
    let bestDistance = HIT_RADIUS
    for (const trade of trades) {
      const distance = Math.hypot(x(trade.at) - px, y(trade.price) - py)
      if (distance < bestDistance) {
        bestDistance = distance
        best = trade.id
      }
    }
    setHoverId(best)
  }

  const tipX = hovered ? Math.min(Math.max(x(hovered.at) - 95, 0), Math.max(0, width - 190)) : 0
  const tipY = hovered ? Math.max(0, y(hovered.price) - 100) : 0

  return (
    <Plot
      ref={plotRef}
      $height={height}
      dir="ltr"
      role="img"
      aria-label={`${t.charts.transactions}: ${trades.length} ${t.charts.trades}`}
      onPointerMove={onMove}
      onPointerDown={onMove}
      onPointerLeave={() => setHoverId(null)}
    >
      {width > 0 && (
        <Svg viewBox={`0 0 ${width} ${height}`} aria-hidden>
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={PAD.left} x2={PAD.left + plotW} y1={y(v)} y2={y(v)} stroke={theme.colors.border} strokeDasharray="2 4" />
              <text x={PAD.left + plotW + 10} y={y(v) + 4}>
                {formatMoney(v)}
              </text>
            </g>
          ))}
          {xTicks.map((iso, i) => (
            <g key={iso}>
              <line x1={x(iso)} x2={x(iso)} y1={PAD.top} y2={PAD.top + plotH} stroke={theme.colors.border} strokeOpacity="0.55" />
              <text
                x={x(iso)}
                y={height - 6}
                textAnchor={i === 0 ? 'start' : i === xTicks.length - 1 ? 'end' : 'middle'}
              >
                {formatDay(iso, locale, 'axis-short')}
              </text>
            </g>
          ))}
          <line x1={PAD.left} x2={PAD.left + plotW} y1={PAD.top + plotH} y2={PAD.top + plotH} stroke={theme.colors.border} />
          {ordered.map((trade, i) => {
            const tone = healthTone(trade.quality)
            const on = trade.id === hoverId
            return (
              <circle
                key={trade.id}
                className="trade"
                cx={x(trade.at)}
                cy={y(trade.price)}
                r={on ? radius(trade.qty) + 2 : radius(trade.qty)}
                fill={tone.strong}
                fillOpacity={hoverId && !on ? 0.25 : 0.68}
                stroke={theme.colors.creamCard}
                strokeWidth="1.5"
                style={{ animationDelay: `${Math.min(i, 60) * 8}ms` }}
              />
            )
          })}
        </Svg>
      )}
      {hovered && (
        <Tooltip style={{ left: tipX, top: tipY }}>
          <span>
            {formatDay(hovered.at, locale, 'full')} · {hovered.label}
          </span>
          <strong>
            {hovered.qty} × {formatMoney(hovered.price)}
          </strong>
          <span>
            {tr(hovered.seller.en, hovered.seller.he)} → {tr(hovered.buyer.en, hovered.buyer.he)}
          </span>
        </Tooltip>
      )}
    </Plot>
  )
}
