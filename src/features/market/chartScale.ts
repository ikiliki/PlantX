import { useLayoutEffect, useRef, useState } from 'react'
import type { Locale } from '../../mock/types'

export type ChartRange = '1W' | '1M' | '3M' | '6M' | '1Y'

export const CHART_RANGES: { id: ChartRange; days: number }[] = [
  { id: '1W', days: 7 },
  { id: '1M', days: 30 },
  { id: '3M', days: 91 },
  { id: '6M', days: 182 },
  { id: '1Y', days: 365 },
]

export function niceTicks(min: number, max: number, count = 4): number[] {
  const span = max - min || Math.abs(max) || 1
  const raw = span / count
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const norm = raw / magnitude
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * magnitude
  const ticks: number[] = []
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-6; v += step) {
    ticks.push(Math.round(v / step) * step)
  }
  return ticks
}

export function logTicks(min: number, max: number): number[] {
  const ticks: number[] = []
  for (let exp = Math.floor(Math.log10(min)); exp <= Math.ceil(Math.log10(max)); exp++) {
    for (const m of [1, 2, 5]) {
      const v = m * 10 ** exp
      if (v >= min && v <= max) ticks.push(v)
    }
  }
  return ticks
}

/** Maps a price to 0..1. Wide spreads (₪8 cuttings next to ₪1,140 trees) switch to log. */
export function priceScale(min: number, max: number) {
  const log = min > 0 && max / min > 6
  if (log) {
    const lo = Math.log(min)
    const span = Math.log(max) - lo || 1
    return { log, at: (v: number) => (Math.log(Math.max(v, min)) - lo) / span, ticks: logTicks(min, max) }
  }
  const span = max - min || 1
  return { log, at: (v: number) => (v - min) / span, ticks: niceTicks(min, max) }
}

export function paddedExtent(values: number[], padRatio = 0.08): [number, number] {
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  const pad = (hi - lo || hi * 0.05 || 1) * padRatio
  return [Math.max(0, lo - pad), hi + pad]
}

/** Extent for priceScale: multiplicative padding when the spread will render on a log axis. */
export function scaleExtent(values: number[], padRatio = 0.08): [number, number] {
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  if (lo > 0 && hi / lo > 6) return [lo / 1.25, hi * 1.15]
  return paddedExtent(values, padRatio)
}

function localeTag(locale: Locale) {
  return locale === 'he' ? 'he-IL' : 'en-GB'
}

export function formatDay(iso: string, locale: Locale, style: 'axis-short' | 'axis-long' | 'full') {
  const date = new Date(`${iso}T12:00:00`)
  const options: Intl.DateTimeFormatOptions =
    style === 'full'
      ? { day: 'numeric', month: 'short', year: 'numeric' }
      : style === 'axis-long'
        ? { month: 'short', year: '2-digit' }
        : { day: 'numeric', month: 'short' }
  return new Intl.DateTimeFormat(localeTag(locale), options).format(date)
}

export function formatCompact(n: number, locale: Locale) {
  return new Intl.NumberFormat(localeTag(locale), { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

export function evenIndices(length: number, count: number) {
  if (length <= 1) return [0]
  const steps = Math.min(count, length) - 1
  return Array.from({ length: steps + 1 }, (_, i) => Math.round((i * (length - 1)) / steps))
}

export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(el.clientWidth)
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return [ref, width] as const
}
