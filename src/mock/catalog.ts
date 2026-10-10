import { CATALOG_PLANTS } from './catalogGuide'
import { classDictionary } from './classDictionary'
import { defaultPlantPhoto } from './images'
import { MARKET_AREAS } from './locations'
import { STAGE_LABEL, varietyCode } from './marketNaming'
import { BUILT_IN_TASKS } from '../features/todo/carePlan'
import { allCareSuggestions } from '../features/todo/careSuggestions'
import type {
  Catalog,
  CatalogCategory,
  CatalogProperty,
  CatalogPropertyOption,
  CatalogSubcategory,
  Plant,
  QualityGrade,
  SizeBand,
  StageBand,
} from './types'

const HEALTH_OPTIONS: CatalogPropertyOption[] = [
  { id: 'S', label: 'S', labelHe: 'S', sign: 'S' },
  { id: 'A', label: 'A', labelHe: 'A', sign: 'A' },
  { id: 'B', label: 'B', labelHe: 'B', sign: 'B' },
  { id: 'C', label: 'C', labelHe: 'C', sign: 'C' },
  { id: 'D', label: 'D', labelHe: 'D', sign: 'D' },
]

/** Best to worst. Lower rank sorts first. */
export const HEALTH_RANK: Record<QualityGrade, number> = { S: 0, A: 1, B: 2, C: 3, D: 4 }

const SIZE_OPTIONS: CatalogPropertyOption[] = [
  { id: 'S', label: 'S', labelHe: 'S', sign: 'S' },
  { id: 'M', label: 'M', labelHe: 'M', sign: 'M' },
  { id: 'L', label: 'L', labelHe: 'L', sign: 'L' },
  { id: 'XL', label: 'XL', labelHe: 'XL', sign: 'XL' },
]

function opt(id: string, label: string, labelHe: string, sign?: string): CatalogPropertyOption {
  return {
    id,
    label,
    labelHe,
    sign: (sign ?? id).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3),
  }
}

function property(spec: {
  id: string
  name: string
  nameHe: string
  required?: boolean
  inMarketName?: boolean
  sign?: string
  categoryIds?: string[]
  subcategoryIds?: string[]
  options: CatalogPropertyOption[]
}): CatalogProperty {
  return {
    id: spec.id,
    name: spec.name,
    nameHe: spec.nameHe,
    required: Boolean(spec.required),
    inMarketName: Boolean(spec.inMarketName),
    sign: spec.inMarketName ? (spec.sign ?? '').toUpperCase() : '',
    categoryIds: spec.categoryIds ?? [],
    subcategoryIds: spec.subcategoryIds ?? [],
    options: spec.options,
  }
}

export function catalogSlug(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 16)
  return slug || `id-${Date.now().toString(36)}`
}

export function createCatalog(): Catalog {
  const categories: CatalogCategory[] = classDictionary.map((plant) => ({
    id: plant.id,
    speciesId: plant.speciesId,
    name: plant.name,
    nameHe: plant.nameHe,
    ticker: plant.ticker,
    photo: plant.cover || defaultPlantPhoto,
  }))

  const subcategories: CatalogSubcategory[] = classDictionary.flatMap((plant) => {
    const seen = new Set<string>()
    return plant.classes.flatMap((item) => {
      const id = `${plant.id}-${item.varietyCode.toLowerCase()}`
      if (seen.has(id)) return []
      seen.add(id)
      return [
        {
          id,
          categoryId: plant.id,
          name: item.variety,
          nameHe: item.varietyHe,
          code: item.varietyCode,
        },
      ]
    })
  })

  const properties: CatalogProperty[] = [
    property({
      id: 'health',
      name: 'Health',
      nameHe: 'בריאות',
      required: true,
      inMarketName: true,
      sign: 'HLT',
      options: HEALTH_OPTIONS,
    }),
    property({
      id: 'size',
      name: 'Size',
      nameHe: 'גודל',
      required: true,
      options: SIZE_OPTIONS,
    }),
    property({
      id: 'stage',
      name: 'Stage',
      nameHe: 'שלב',
      required: true,
      options: (['CUT', 'ROOTED', 'EST', 'MATURE'] as StageBand[]).map((id) =>
        opt(id, STAGE_LABEL[id].en, STAGE_LABEL[id].he, STAGE_LABEL[id].short),
      ),
    }),
    property({
      id: 'area',
      name: 'Area',
      nameHe: 'אזור',
      required: false,
      options: MARKET_AREAS.map((area) => opt(area.id, area.region, area.regionHe)),
    }),
    property({
      id: 'growth-form',
      name: 'Growth form',
      nameHe: 'צורת גידול',
      required: true,
      inMarketName: true,
      sign: 'GF',
      categoryIds: ['pothos'],
      options: [
        opt('climbing', 'Climbing', 'מטפס'),
        opt('hanging', 'Hanging', 'תלוי'),
        opt('bush', 'Bush', 'שיחי'),
      ],
    }),
    property({
      id: 'fenestration',
      name: 'Fenestration',
      nameHe: 'חלונות',
      inMarketName: true,
      sign: 'FEN',
      categoryIds: ['monstera'],
      options: [
        opt('juvenile', 'Juvenile', 'צעיר'),
        opt('fenestrated', 'Fenestrated', 'עם חלונות'),
        opt('full-splits', 'Full splits', 'שסעים מלאים'),
      ],
    }),
    property({
      id: 'variegation',
      name: 'Variegation',
      nameHe: 'מגוון',
      inMarketName: true,
      sign: 'VAR',
      subcategoryIds: ['pothos-gold'],
      options: [opt('high', 'High', 'גבוה'), opt('medium', 'Medium', 'בינוני'), opt('low', 'Low', 'נמוך')],
    }),
    property({
      id: 'cream-edge',
      name: 'Cream edge',
      nameHe: 'שולי קרם',
      inMarketName: true,
      sign: 'CED',
      subcategoryIds: ['pothos-njoy'],
      options: [opt('wide', 'Wide', 'רחב'), opt('narrow', 'Narrow', 'צר')],
    }),
  ]

  for (const plant of CATALOG_PLANTS) {
    if (!categories.some((item) => item.id === plant.id)) {
      categories.push({
        id: plant.id,
        speciesId: plant.speciesId,
        name: plant.name,
        nameHe: plant.nameHe,
        ticker: plant.ticker,
        photo: plant.photo,
      })
    }
    for (const sub of plant.subs) {
      const existing = subcategories.find((item) => item.id === sub.id)
      if (!existing) {
        subcategories.push({
          id: sub.id,
          categoryId: plant.id,
          name: sub.name,
          nameHe: sub.nameHe,
          code: sub.code,
          photo: sub.photo,
        })
      } else if (!existing.photo) {
        existing.photo = sub.photo
      }
    }
  }

  // Care: the starting tasks and the AI suggestions for every category.
  const careTasks = BUILT_IN_TASKS.map((task) => ({ ...task }))
  const careRules = allCareSuggestions(categories.map((item) => item.id))
  return { categories, subcategories, properties, careTasks, careRules }
}

const RETIRED_CATEGORY_IDS = new Set(['maple', 'philodendron', 'palm', 'olive'])
const RETIRED_SPECIES_IDS = new Set(['sp-maple', 'sp-philodendron', 'sp-palm', 'sp-olive', 'sp-mix'])

function mergeById<T extends { id: string }>(current: T[] | undefined, seed: T[]) {
  const rows = [...(current ?? [])]
  for (const item of seed) {
    if (!rows.some((row) => row.id === item.id)) rows.push(item)
  }
  return rows
}

function defaultTraits(plant: Plant): Record<string, string> {
  const cutting = plant.stage === 'CUT' || plant.stage === 'ROOTED'
  const key = `${plant.speciesId}|${plant.variety ?? ''}`
  const table: Record<string, Record<string, string>> = {
    'sp-pothos|Golden': {
      'growth-form': cutting ? 'bush' : 'climbing',
      variegation: plant.quality === 'A' ? 'high' : 'medium',
    },
    "sp-pothos|N'Joy": { 'growth-form': 'bush', 'cream-edge': 'wide' },
    'sp-monstera|Standard': { fenestration: plant.sizeBand === 'XL' ? 'full-splits' : 'fenestrated' },
    'sp-monstera|Statement': { fenestration: 'full-splits' },
  }
  return table[key] ?? {}
}

export function ensureCatalog(db: { catalog?: Catalog; plants?: Plant[] }) {
  const seed = createCatalog()
  const seedCategoryIds = new Set(seed.categories.map((item) => item.id))
  const seedSubIds = new Set(seed.subcategories.map((item) => item.id))
  const seedPropertyIds = new Set(seed.properties.map((item) => item.id))
  const categories = mergeById(db.catalog?.categories, seed.categories).filter(
    (item) => !RETIRED_CATEGORY_IDS.has(item.id) && !RETIRED_SPECIES_IDS.has(item.speciesId),
  )
  const categoryIds = new Set(categories.map((item) => item.id))
  const subcategories = mergeById(db.catalog?.subcategories, seed.subcategories).filter((item) => {
    if (!categoryIds.has(item.categoryId)) return false
    if (seedCategoryIds.has(item.categoryId)) return seedSubIds.has(item.id)
    return true
  })
  const subIds = new Set(subcategories.map((item) => item.id))
  const properties = mergeById(db.catalog?.properties, seed.properties)
    .map((item) => {
      const seeded = seed.properties.find((row) => row.id === item.id)
      const inMarketName = item.inMarketName ?? seeded?.inMarketName ?? false
      return {
        ...item,
        inMarketName,
        sign: inMarketName ? (item.sign || seeded?.sign || '') : '',
        options: item.options.map((option) => {
          const seededOption = seeded?.options.find((row) => row.id === option.id)
          const sign = option.sign || seededOption?.sign || option.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3)
          return { ...option, sign }
        }),
        categoryIds: item.categoryIds.filter((id) => categoryIds.has(id) && !RETIRED_CATEGORY_IDS.has(id)),
        subcategoryIds: item.subcategoryIds.filter((id) => subIds.has(id)),
      }
    })
    .filter(
      (item) =>
        seedPropertyIds.has(item.id) || item.categoryIds.length > 0 || item.subcategoryIds.length > 0,
    )
  const careTasks = db.catalog?.careTasks?.length ? db.catalog.careTasks : seed.careTasks
  const taskIds = new Set(careTasks.map((task) => task.id))
  const careRules = (db.catalog?.careRules?.length ? db.catalog.careRules : seed.careRules).filter(
    (rule) => taskIds.has(rule.taskId) && categoryIds.has(rule.categoryId) && (!rule.subcategoryId || subIds.has(rule.subcategoryId)),
  )
  db.catalog = { categories, subcategories, properties, careTasks, careRules }
  for (const plant of db.plants ?? []) hydratePlantCatalog(plant, db.catalog)
}

export function hydratePlantCatalog(plant: Plant, catalog: Catalog) {
  const category = catalog.categories.find((item) => item.speciesId === plant.speciesId)
  if (!plant.subcategoryId && category) {
    const match = catalog.subcategories.find(
      (item) =>
        item.categoryId === category.id &&
        (item.name === plant.variety ||
          item.nameHe === plant.varietyHe ||
          item.code === varietyCode(plant.variety ?? '')),
    )
    if (match) plant.subcategoryId = match.id
  }
  const inferred = defaultTraits(plant)
  plant.traits = { ...inferred, ...(plant.traits ?? {}) }
}

export function emptyCatalog(): Catalog {
  return { categories: [], subcategories: [], properties: [], careTasks: BUILT_IN_TASKS.map((task) => ({ ...task })), careRules: [] }
}

export function isHealth(value: string): value is QualityGrade {
  return value === 'S' || value === 'A' || value === 'B' || value === 'C' || value === 'D'
}

export function isSize(value: string): value is SizeBand {
  return value === 'S' || value === 'M' || value === 'L' || value === 'XL'
}

export function isStage(value: string): value is StageBand {
  return value === 'CUT' || value === 'ROOTED' || value === 'EST' || value === 'MATURE'
}
