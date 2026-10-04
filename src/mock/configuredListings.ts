import { classPhotos } from './images'
import { resolveArea } from './locations'
import type { Listing, Plant, RootingStatus, StageBand } from './types'
import type { CareDates } from '../features/todo/todoSchedule'

type Spec = {
  id: string
  code: string
  classId: string
  speciesId: string
  ownerId: string
  variety: string
  varietyHe: string
  title: string
  titleHe: string
  photo: string
  quantity: number
  size: Plant['sizeBand']
  quality: Plant['quality']
  stage: StageBand
  price: number
  unit: Listing['unit']
  region: string
  lat: number
  lng: number
  offers?: boolean
  verified?: boolean
}

const specs: Spec[] = [
  {
    id: 'pot-gold-a-xl-mat',
    code: 'POT-GOLD-A-XL-MAT',
    classId: 'mc-pot-gold-a-xl-mat',
    speciesId: 'sp-pothos',
    ownerId: 'u-maya',
    variety: 'Golden',
    varietyHe: 'זהוב',
    title: 'Golden pothos on poles',
    titleHe: 'פוטוס זהוב על מוטות',
    photo: classPhotos.potGoldXl,
    quantity: 1,
    size: 'XL',
    quality: 'A',
    stage: 'MATURE',
    price: 86,
    unit: 'plant',
    region: 'Tel Aviv',
    lat: 32.08,
    lng: 34.78,
    offers: true,
    verified: true,
  },
  {
    id: 'pot-gold-a-l-mat',
    code: 'POT-GOLD-A-L-MAT',
    classId: 'mc-pot-gold-a-l-mat',
    speciesId: 'sp-pothos',
    ownerId: 'u-maya',
    variety: 'Golden',
    varietyHe: 'זהוב',
    title: 'Golden pothos climbing a trunk',
    titleHe: 'פוטוס זהוב מטפס על גזע',
    photo: classPhotos.potGoldL,
    quantity: 1,
    size: 'L',
    quality: 'A',
    stage: 'MATURE',
    price: 46,
    unit: 'plant',
    region: 'Central Israel',
    lat: 31.97,
    lng: 34.81,
    verified: true,
  },
  {
    id: 'pot-gold-a-s-r',
    code: 'POT-GOLD-A-S-R',
    classId: 'mc-pot-gold-a-s-r',
    speciesId: 'sp-pothos',
    ownerId: 'u-maya',
    variety: 'Golden',
    varietyHe: 'זהוב',
    title: 'Rooted golden pothos cutting',
    titleHe: 'ייחור פוטוס זהוב מושרש',
    photo: classPhotos.potGoldS,
    quantity: 12,
    size: 'S',
    quality: 'A',
    stage: 'ROOTED',
    price: 9,
    unit: 'cutting',
    region: 'Central Israel',
    lat: 31.96,
    lng: 34.79,
    offers: true,
  },
  {
    id: 'pot-njoy-b-m-est',
    code: 'POT-NJOY-B-M-EST',
    classId: 'mc-pot-njoy-b-m-est',
    speciesId: 'sp-pothos',
    ownerId: 'u-gal',
    variety: "N'Joy",
    varietyHe: "אן ג'וי",
    title: "N'Joy pothos",
    titleHe: "פוטוס אן ג'וי",
    photo: classPhotos.potNjoy,
    quantity: 4,
    size: 'M',
    quality: 'B',
    stage: 'EST',
    price: 34,
    unit: 'plant',
    region: 'Sharon',
    lat: 32.32,
    lng: 34.85,
  },
  {
    id: 'mon-std-a-l-mat',
    code: 'MON-STD-A-L-MAT',
    classId: 'mc-mon-std-a-l-mat',
    speciesId: 'sp-monstera',
    ownerId: 'u-gal',
    variety: 'Standard',
    varietyHe: 'סטנדרט',
    title: 'Mature monstera',
    titleHe: 'מונסטרה בוגרת',
    photo: classPhotos.monStdL,
    quantity: 3,
    size: 'L',
    quality: 'A',
    stage: 'MATURE',
    price: 68,
    unit: 'plant',
    region: 'Sharon',
    lat: 32.3,
    lng: 34.86,
    verified: true,
  },
  {
    id: 'mon-stmt-a-xl-mat',
    code: 'MON-STMT-A-XL-MAT',
    classId: 'mc-mon-stmt-a-xl-mat',
    speciesId: 'sp-monstera',
    ownerId: 'u-daniel',
    variety: 'Statement',
    varietyHe: 'מוקד',
    title: 'Statement monstera specimen',
    titleHe: 'מונסטרה מוקד',
    photo: classPhotos.monStdXl,
    quantity: 1,
    size: 'XL',
    quality: 'A',
    stage: 'MATURE',
    price: 145,
    unit: 'plant',
    region: 'Tel Aviv',
    lat: 32.09,
    lng: 34.77,
    offers: true,
    verified: true,
  },
]

function rootingFor(stage: StageBand): RootingStatus {
  if (stage === 'ROOTED') return 'rooted'
  if (stage === 'CUT') return 'unrooted'
  return 'established'
}

function located(spec: Spec) {
  const area = resolveArea(spec.region)
  if (!area) throw new Error(`Unknown listing region: ${spec.region}`)
  return area
}

export const configuredPlants: Plant[] = specs.map((spec) => {
  const area = located(spec)
  return {
    id: `pl-cfg-${spec.id}`,
    code: spec.code,
    ownerId: spec.ownerId,
    speciesId: spec.speciesId,
    marketClassId: spec.classId,
    variety: spec.variety,
    varietyHe: spec.varietyHe,
    title: spec.title,
    titleHe: spec.titleHe,
    photos: [spec.photo],
    quantity: spec.quantity,
    sizeGrade: spec.size ?? 'M',
    sizeBand: spec.size,
    quality: spec.quality,
    rooting: rootingFor(spec.stage),
    stage: spec.stage,
    locationZone: area.region,
    locationZoneHe: area.regionHe,
    lat: spec.lat,
    lng: spec.lng,
    status: 'listed',
    createdAt: '2026-09-20',
    verifiedAt: spec.verified ? '2026-09-20' : undefined,
    verifiedBy: spec.verified ? 'u-dana' : undefined,
    history: [{ at: '2026-09-20', label: 'Listed from configuration', labelHe: 'פורסם לפי התצורה' }],
  }
})

/** Demo care dates for the configured plants; `seedCareTodos` turns them into todos. */
export const configuredCareDates: CareDates = Object.fromEntries(
  specs.map((spec) => [
    `pl-cfg-${spec.id}`,
    { photoAt: spec.verified ? '2026-09-28' : '2026-09-10', wateredAt: spec.verified ? '2026-09-29' : '2026-09-18' },
  ]),
)

export const configuredListings: Listing[] = specs.map((spec) => {
  const area = located(spec)
  return {
    id: `ls-cfg-${spec.id}`,
    plantId: `pl-cfg-${spec.id}`,
    sellerId: spec.ownerId,
    marketClassId: spec.classId,
    price: spec.price,
    quantity: spec.quantity,
    unit: spec.unit,
    pickupOnly: true,
    allowOffers: Boolean(spec.offers),
    status: 'active',
    createdAt: '2026-09-20',
    region: area.region,
    regionHe: area.regionHe,
  }
})
