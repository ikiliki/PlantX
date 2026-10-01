import { classTrades } from '../../mock/marketHistory'
import type { Locale, MarketClass, MockDb, Species } from '../../mock/types'
import type { RangeRow } from './components/PriceRanges/PriceRanges'
import type { ChartTrade } from './components/TradeChart/TradeChart'
import type { GradeOption } from './components/GradeFilter/GradeFilter'

export type CategoryGroup = { species: Species; classes: MarketClass[] }

export function categoryGroups(db: MockDb): CategoryGroup[] {
  return db.species
    .map((species) => ({ species, classes: db.marketClasses.filter((mc) => mc.speciesId === species.id) }))
    .filter((group) => group.classes.length > 0)
}

export function filterByGrade(classes: MarketClass[], grade: string) {
  return grade === 'all' ? classes : classes.filter((mc) => mc.quality === grade)
}

export function gradeOptions(classes: MarketClass[]): GradeOption[] {
  const counts = new Map<string, number>()
  for (const mc of classes) counts.set(mc.quality, (counts.get(mc.quality) ?? 0) + 1)
  return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([grade, count]) => ({ grade, count }))
}

export function className(mc: MarketClass, locale: Locale) {
  return locale === 'he' ? mc.displayNameHe : mc.displayName
}

export function speciesName(species: Species, locale: Locale) {
  return locale === 'he' ? species.commonNameHe : species.commonName
}

export function classRow(mc: MarketClass, locale: Locale, highlightId?: string): RangeRow {
  return {
    id: mc.id,
    label: className(mc, locale),
    sub: mc.code,
    grade: mc.quality,
    low: Math.min(mc.rangeMin, mc.lastPrice),
    high: Math.max(mc.rangeMax, mc.lastPrice),
    last: mc.lastPrice,
    href: mc.id === highlightId ? undefined : `/market/${mc.id}`,
    highlight: mc.id === highlightId,
    classId: mc.id,
    speciesId: mc.speciesId,
  }
}

export function categoryRow(group: CategoryGroup, locale: Locale, classesLabel: string): RangeRow {
  const grades = [...new Set(group.classes.map((mc) => mc.quality))].sort().join(' · ')
  return {
    id: group.species.id,
    label: speciesName(group.species, locale),
    sub: `${group.classes.length} ${classesLabel} · ${grades}`,
    low: Math.min(...group.classes.map((mc) => Math.min(mc.rangeMin, mc.lastPrice))),
    high: Math.max(...group.classes.map((mc) => Math.max(mc.rangeMax, mc.lastPrice))),
    marks: group.classes.map((mc) => ({
      id: mc.id,
      value: mc.lastPrice,
      grade: mc.quality,
      label: mc.code,
    })),
    href: `/market/categories/${group.species.id}`,
    speciesId: group.species.id,
  }
}

export function tradesFor(classes: MarketClass[]): ChartTrade[] {
  return classes
    .flatMap((mc) => classTrades(mc).map((trade) => ({ ...trade, label: mc.code })))
    .sort((a, b) => b.at.localeCompare(a.at) || b.price - a.price)
}
