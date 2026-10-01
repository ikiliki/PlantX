import { buildMarketCode, buildMarketDisplay } from './marketNaming'
import type { Locale, QualityGrade, SizeBand, StageBand } from './types'

export type DictClass = {
  code: string
  name: string
  nameHe: string
  photo: string
  variety: string
  varietyHe: string
  varietyCode: string
  quality: QualityGrade
  size: SizeBand
  stage: StageBand
  author: string
  license: string
  licenseUrl: string
  source: string
  observed: string
  observedHe: string
}

export type DictPlant = {
  id: string
  speciesId: string
  ticker: string
  name: string
  nameHe: string
  cover: string
  classes: DictClass[]
}

function entry(spec: {
  ticker: string
  species: string
  speciesHe: string
  variety: string
  varietyHe: string
  varietyCode: string
  quality: QualityGrade
  size: SizeBand
  stage: StageBand
  photo: string
  author: string
  license: string
  licenseUrl: string
  source: string
  observed: string
  observedHe: string
}): DictClass {
  return {
    code: buildMarketCode(spec),
    name: buildMarketDisplay({ ...spec, locale: 'en' }),
    nameHe: buildMarketDisplay({ ...spec, locale: 'he' }),
    photo: spec.photo,
    variety: spec.variety,
    varietyHe: spec.varietyHe,
    varietyCode: spec.varietyCode,
    quality: spec.quality,
    size: spec.size,
    stage: spec.stage,
    author: spec.author,
    license: spec.license,
    licenseUrl: spec.licenseUrl,
    source: spec.source,
    observed: spec.observed,
    observedHe: spec.observedHe,
  }
}

const file = (name: string) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(name)}`

export const classDictionary: DictPlant[] = [
  {
    id: 'pothos',
    speciesId: 'sp-pothos',
    ticker: 'POT',
    name: 'Pothos',
    nameHe: 'פוטוס',
    cover: '/class-photos/pot-gold-a-xl-mat.jpg',
    classes: [
      entry({
        ticker: 'POT',
        species: 'Pothos',
        speciesHe: 'פוטוס',
        variety: 'Golden',
        varietyHe: 'זהוב',
        varietyCode: 'GOLD',
        quality: 'A',
        size: 'XL',
        stage: 'MATURE',
        photo: '/class-photos/pot-gold-a-xl-mat.jpg',
        author: 'Dinesh Valke',
        license: 'CC BY-SA 2.0',
        licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0',
        source: file('Epipremnum aureum (405626861).jpg'),
        observed: 'Dense golden pothos on several poles. Yellow streaks, full canopy, no pests or torn leaves.',
        observedHe: 'פוטוס זהוב צפוף על כמה מוטות. פסי צהוב, נוף מלא, בלי מזיקים או עלים קרועים.',
      }),
      entry({
        ticker: 'POT',
        species: 'Pothos',
        speciesHe: 'פוטוס',
        variety: 'Golden',
        varietyHe: 'זהוב',
        varietyCode: 'GOLD',
        quality: 'A',
        size: 'L',
        stage: 'MATURE',
        photo: '/class-photos/pot-gold-a-l-mat.jpg',
        author: "Filo gèn'",
        license: 'CC BY-SA 4.0',
        licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
        source: file('Epipremnum aureum (Golden pothos).jpg'),
        observed: 'Climbing a trunk outdoors. Large leaves with cream-yellow marbling, healthy and even.',
        observedHe: 'מטפס על גזע בחוץ. עלים גדולים עם שיש קרם-צהוב, בריא ואחיד.',
      }),
      entry({
        ticker: 'POT',
        species: 'Pothos',
        speciesHe: 'פוטוס',
        variety: 'Golden',
        varietyHe: 'זהוב',
        varietyCode: 'GOLD',
        quality: 'A',
        size: 'S',
        stage: 'ROOTED',
        photo: '/class-photos/pot-gold-a-s-r.png',
        author: 'Ddra5202',
        license: 'CC BY-SA 4.0',
        licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
        source: file("Epipremnum Aureum (Devil's Ivy) cutting.png"),
        observed: 'One stem, two clean leaves, roots starting at the nodes. A rooted cutting, not a potted plant.',
        observedHe: 'גבעול אחד, שני עלים נקיים, שורשים מתחילים במפרקים. ייחור מושרש, לא עציץ.',
      }),
      entry({
        ticker: 'POT',
        species: 'Pothos',
        speciesHe: 'פוטוס',
        variety: "N'Joy",
        varietyHe: "אן ג'וי",
        varietyCode: 'NJOY',
        quality: 'B',
        size: 'M',
        stage: 'EST',
        photo: '/class-photos/pot-njoy-b-m-est.jpg',
        author: 'Mokkie',
        license: 'CC BY-SA 3.0',
        licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
        source: file("Money Plant (Epipremnum aureum 'N' Joy') 1.jpg"),
        observed: "Bushy N'Joy with cream edges. A scratch and a small brown speck, so grade B.",
        observedHe: "N'Joy שיחי עם שולי קרם. שריטה ונקודה חומה קטנה, לכן דרגה B.",
      }),
    ],
  },
  {
    id: 'monstera',
    speciesId: 'sp-monstera',
    ticker: 'MON',
    name: 'Monstera',
    nameHe: 'מונסטרה',
    cover: '/class-photos/mon-std-a-xl-mat.jpg',
    classes: [
      entry({
        ticker: 'MON',
        species: 'Monstera',
        speciesHe: 'מונסטרה',
        variety: 'Standard',
        varietyHe: 'סטנדרט',
        varietyCode: 'STD',
        quality: 'A',
        size: 'L',
        stage: 'MATURE',
        photo: '/class-photos/mon-std-a-l-mat.jpg',
        author: 'kallerna',
        license: 'CC BY-SA 4.0',
        licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
        source: file('Indoor Monstera deliciosa.jpg'),
        observed: 'Indoor plant with large split leaves. Foliage looks healthy; the pot is out of frame, so size is from the leaves.',
        observedHe: 'צמח פנימי עם עלים גדולים ומחולקים. העלווה נראית בריאה; העציץ מחוץ לפריים, והגודל נקבע לפי העלים.',
      }),
      entry({
        ticker: 'MON',
        species: 'Monstera',
        speciesHe: 'מונסטרה',
        variety: 'Standard',
        varietyHe: 'סטנדרט',
        varietyCode: 'STD',
        quality: 'A',
        size: 'XL',
        stage: 'MATURE',
        photo: '/class-photos/mon-std-a-xl-mat.jpg',
        author: 'Wouter Hagens',
        license: 'Public domain',
        licenseUrl: 'https://commons.wikimedia.org/wiki/File:Monstera_deliciosa_A.jpg',
        source: file('Monstera deliciosa A.jpg'),
        observed: 'Flowering garden specimen with thick stems and very large leaves.',
        observedHe: 'פרט גן פורח עם גבעולים עבים ועלים גדולים מאוד.',
      }),
      entry({
        ticker: 'MON',
        species: 'Monstera',
        speciesHe: 'מונסטרה',
        variety: 'Statement',
        varietyHe: 'מוקד',
        varietyCode: 'STMT',
        quality: 'A',
        size: 'XL',
        stage: 'MATURE',
        photo: '/class-photos/mon-std-a-xl-mat.jpg',
        author: 'Wouter Hagens',
        license: 'Public domain',
        licenseUrl: 'https://commons.wikimedia.org/wiki/File:Monstera_deliciosa_A.jpg',
        source: file('Monstera deliciosa A.jpg'),
        observed: 'Single showpiece with thick stems and mature fenestration — the collector listing on the market.',
        observedHe: 'פריט תצוגה יחיד עם גבעולים עבים וחלונות בוגרים — הרישום של האספן בשוק.',
      }),
    ],
  },
]

export const classCodeLegend = ['Species', 'Variety', 'Grade', 'Size', 'Stage'] as const

export const configuredSpeciesIds = classDictionary.map((plant) => plant.speciesId)

export function categoryName(plant: DictPlant, locale: Locale) {
  return locale === 'he' ? plant.nameHe : plant.name
}
