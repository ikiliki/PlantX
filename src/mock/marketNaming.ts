import type { QualityGrade, RootingStatus, SizeBand, StageBand } from './types'

export const STAGE_LABEL: Record<StageBand, { en: string; he: string; short: string }> = {
  CUT: { en: 'Cutting', he: 'ייחור', short: 'CUT' },
  ROOTED: { en: 'Rooted', he: 'מושרש', short: 'R' },
  EST: { en: 'Established', he: 'מבוסס', short: 'EST' },
  MATURE: { en: 'Mature', he: 'בוגר', short: 'MAT' },
}

export const SIZE_LABEL: Record<SizeBand, { en: string; he: string }> = {
  S: { en: 'S', he: 'קטן' },
  M: { en: 'M', he: 'בינוני' },
  L: { en: 'L', he: 'גדול' },
  XL: { en: 'XL', he: 'ענק' },
}

export const HEALTH_MEANING: Record<QualityGrade, { en: string; he: string }> = {
  S: {
    en: 'Best condition',
    he: 'מצב מיטבי',
  },
  A: {
    en: 'Healthy foliage, no pests/damage, strong roots, good symmetry',
    he: 'עלים בריאים, ללא מזיקים/נזק, שורשים חזקים, סימטריה טובה',
  },
  B: {
    en: 'Minor cosmetic damage allowed; otherwise healthy',
    he: 'נזק קוסמטי קל מותר; אחרת בריא',
  },
  C: {
    en: 'Needs rehabilitation',
    he: 'צריך שיקום',
  },
  D: {
    en: 'Low condition',
    he: 'מצב נמוך',
  },
}

export function rootingToStage(rooting: RootingStatus, sizeGrade?: string): StageBand {
  if (sizeGrade === 'mature' || sizeGrade === 'specimen') return 'MATURE'
  if (rooting === 'established') return 'EST'
  if (rooting === 'rooted') return 'ROOTED'
  return 'CUT'
}

export function inferSizeBand(sizeGrade: string, potSizeCm?: number, stemLengthCm?: number): SizeBand {
  const g = sizeGrade.toLowerCase()
  if (g.includes('xl') || g.includes('1.2') || g.includes('1.4') || (potSizeCm && potSizeCm >= 28))
    return 'XL'
  if (g.includes('l') || g.includes('60') || g.includes('stand') || (potSizeCm && potSizeCm >= 18))
    return 'L'
  if (g.includes('cutting') || g.includes('s') || (stemLengthCm && stemLengthCm < 12)) return 'S'
  if (g.includes('m') || g.includes('mature')) return 'M'
  return 'M'
}

export function buildMarketCode(parts: {
  ticker: string
  varietyCode: string
  quality: QualityGrade | ''
  size: SizeBand
  stage: StageBand
}) {
  const stageShort = STAGE_LABEL[parts.stage].short
  const grade = parts.quality ? `${parts.quality}-` : ''
  return `${parts.ticker}-${parts.varietyCode}-${grade}${parts.size}-${stageShort}`
}

export function buildMarketDisplay(parts: {
  species: string
  variety: string
  quality: QualityGrade | ''
  size: SizeBand
  stage: StageBand
  locale: 'he' | 'en'
}) {
  const stage = STAGE_LABEL[parts.stage][parts.locale]
  const grade = parts.quality ? `${parts.quality} · ` : ''
  // An Other plant uses the AI's name for both; say it once.
  const sameName = !parts.variety.trim() || parts.variety.trim().toLowerCase() === parts.species.trim().toLowerCase()
  const name = sameName ? parts.species : `${parts.species} ${parts.variety}`
  return `${name} · ${grade}${parts.size} · ${stage}`
}

export function varietyCode(variety: string) {
  return variety
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 8)
}
