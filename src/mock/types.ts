export type Locale = 'he' | 'en'
export type UserRole =
  | 'grower'
  | 'collector'
  | 'business'
  | 'nursery'
  | 'admin'
  | 'guest'

export type QualityGrade = 'A' | 'B' | 'C'
/** Community swipe grade. Kept off catalog quality so market class codes stay A/B/C. */
export type CommunityGradeLetter = 'S' | 'A' | 'B' | 'C'

export interface CommunityGrade {
  letter: CommunityGradeLetter
  at: string
  /** Used only to hide a plant this person already graded. Never shown. */
  graderId: string
}
export type PlantRarity = 'common' | 'rare' | 'unique'

export interface GrowthTime {
  en: string
  he: string
}

export interface GrowingConditions {
  light: string
  lightHe: string
  water: string
  waterHe: string
  note: string
  noteHe: string
}
export type SizeBand = 'S' | 'M' | 'L' | 'XL'
export type StageBand = 'CUT' | 'ROOTED' | 'EST' | 'MATURE'
export type RootingStatus = 'rooted' | 'unrooted' | 'established'
export type ListingStatus = 'active' | 'reserved' | 'sold' | 'draft'
export type OrderStatus =
  | 'intent'
  | 'confirmed'
  | 'handoff'
  | 'completed'
  | 'disputed'
  | 'cancelled'
export type ModerationStatus = 'open' | 'resolved' | 'dismissed'

export interface User {
  id: string
  name: string
  nameHe: string
  role: UserRole
  businessName?: string
  businessNameHe?: string
  region: string
  regionHe: string
  lat?: number
  lng?: number
  bio: string
  bioHe: string
  rating: number
  completedOrders: number
  verificationRate: number
  cancellations: number
  specialties: string[]
  specialtiesHe: string[]
  avatarColor: string
  email?: string
  friendIds: string[]
  /** Absent means active. Disabled accounts cannot sign in. */
  accountStatus?: 'active' | 'disabled'
}

export type PendingUserStatus = 'pending' | 'approved' | 'rejected'

export interface PendingUser {
  id: string
  name: string
  email: string
  note?: string
  createdAt: string
  status: PendingUserStatus
  approvedAt?: string
  rejectedAt?: string
  userId?: string
}

export type PendingTransactionStatus = 'pending' | 'released' | 'cancelled'

export interface PendingTransaction {
  id: string
  kind: 'purchase' | 'listing' | 'transfer'
  userId: string
  label: string
  labelHe: string
  amount?: number
  createdAt: string
  status: PendingTransactionStatus
}

export interface Species {
  id: string
  commonName: string
  commonNameHe: string
  scientificName: string
  fungibility: 'common' | 'premium'
  ticker: string
  rarity: PlantRarity
  growthTime: GrowthTime
  conditions: GrowingConditions
}

export interface Plant {
  id: string
  code: string
  ownerId: string
  speciesId: string
  marketClassId?: string
  variety?: string
  varietyHe?: string
  subcategoryId?: string
  /** Extra catalog properties. Grade, size, and stage stay on the plant fields. */
  traits?: Record<string, string>
  title: string
  titleHe: string
  description?: string
  descriptionHe?: string
  photos: string[]
  quantity: number
  sizeGrade: string
  sizeBand?: SizeBand
  quality: QualityGrade
  rooting: RootingStatus
  stage?: StageBand
  potFormat?: string
  potFormatHe?: string
  potSizeCm?: number
  stemLengthCm?: number
  leafCount?: number
  locationZone: string
  locationZoneHe: string
  lat: number
  lng: number
  parentId?: string
  batchId?: string
  propagatedAt?: string
  verifiedAt?: string
  verifiedBy?: string
  /** Last time the owner refreshed the listing photo. Falls back to verifiedAt. */
  photoAt?: string
  /** Last time the owner confirmed watering. */
  wateredAt?: string
  status: 'owned' | 'listed' | 'sold'
  /** Set by a greenhouse publish. Independent of an active market listing. */
  publishedAt?: string
  grades?: CommunityGrade[]
  /** Overrides the species default when this specimen differs. */
  rarity?: PlantRarity
  growthTime?: GrowthTime
  conditions?: GrowingConditions
  createdAt: string
  history: { at: string; label: string; labelHe: string }[]
  comps?: { price: number; date: string; note: string; noteHe: string }[]
}

export interface MarketClass {
  id: string
  code: string
  speciesId: string
  variety: string
  varietyHe: string
  quality: QualityGrade
  size: SizeBand
  stage: StageBand
  displayName: string
  displayNameHe: string
  photo: string
  lastPrice: number
  changePct: number
  bidQty: number
  askQty: number
  supplyUnits: number
  demandUnits: number
  rangeMin: number
  rangeMax: number
  asks: { qty: number; price: number; sellerLabel: string; sellerLabelHe: string }[]
  bids: { qty: number; price: number; buyerLabel: string; buyerLabelHe: string }[]
}

export interface Listing {
  id: string
  plantId: string
  sellerId: string
  marketClassId?: string
  price: number
  quantity: number
  unit: 'plant' | 'cutting' | 'bundle'
  bundleSize?: number
  pickupOnly: boolean
  allowOffers: boolean
  status: ListingStatus
  createdAt: string
  region: string
  regionHe: string
}

export interface Order {
  id: string
  buyerId: string
  sellerIds: string[]
  listingId?: string
  items: {
    plantId: string
    title: string
    titleHe: string
    qty: number
    unitPrice: number
    photo: string
  }[]
  total: number
  status: OrderStatus
  handoffNotes?: string
  createdAt: string
  completedAt?: string
  deliveryDate?: string
  deliveryPlace?: string
  deliveryPlaceHe?: string
}

export interface Offer {
  id: string
  listingId: string
  fromUserId: string
  toUserId: string
  amount: number
  message: string
  messageHe: string
  status: 'open' | 'accepted' | 'declined' | 'withdrawn'
  createdAt: string
}

export interface MessageThread {
  id: string
  participants: string[]
  subject: string
  subjectHe: string
  relatedListingId?: string
  messages: {
    id: string
    fromUserId: string
    body: string
    bodyHe: string
    at: string
  }[]
}

export interface ModerationItem {
  id: string
  type: 'stolen_photo' | 'pest_dispute' | 'suspicious_listing' | 'claim_draft'
  title: string
  titleHe: string
  targetId: string
  status: ModerationStatus
  createdAt: string
  details: string
  detailsHe: string
}

export interface ClaimDraft {
  id: string
  preparedForName: string
  preparedForNameHe: string
  speciesId: string
  title: string
  titleHe: string
  price: number
  quantity: number
  photo: string
  region: string
  regionHe: string
  claimedBy?: string
}

export type FeedUpdateKind = 'photo' | 'water' | 'propagate' | 'grade' | 'passport' | 'listing'

export interface FeedUpdate {
  id: string
  kind: FeedUpdateKind
  userId: string
  plantId?: string
  body: string
  bodyHe: string
  createdAt: string
}

export interface TopGreenhouse {
  id: string
  userId: string
  grade: number
  line: string
  lineHe: string
}

export type CatalogPropertyOption = {
  id: string
  label: string
  labelHe: string
  /** 1–3 capital letters. Replaces the property placeholder in a market name. */
  sign: string
}

export type CatalogProperty = {
  id: string
  name: string
  nameHe: string
  required: boolean
  /** When set, this property is part of the market name and `sign` is its unique 1–3 letter code. */
  inMarketName: boolean
  sign: string
  categoryIds: string[]
  subcategoryIds: string[]
  options: CatalogPropertyOption[]
}

export type CatalogCategory = {
  id: string
  speciesId: string
  name: string
  nameHe: string
  ticker: string
  photo: string
}

export type CatalogSubcategory = {
  id: string
  categoryId: string
  name: string
  nameHe: string
  code: string
  photo?: string
}

export type Catalog = {
  categories: CatalogCategory[]
  subcategories: CatalogSubcategory[]
  properties: CatalogProperty[]
}

export type UpdateScenario = 'empty' | 'one' | 'multiple' | 'mixed'
export type TopGreenhouseScenario = 'empty' | 'ranked' | 'tied' | 'single'
export type MarketScenario =
  | 'none'
  | 'one'
  | 'some'
  | 'pages'
  | 'mixed'
  | 'category'
  | 'prices'
  | 'listings'
export type GreenhouseScenario = 'empty' | 'one' | 'several' | 'mixed' | 'listed'
export type GradeStackScenario = 'empty' | 'one' | 'few' | 'full'
export type PublishRequirement = 'none' | 'verified' | 'graded'
export type MarketBannerScenario = 'empty' | 'few' | 'full'
export type TradeScenario = 'none' | 'one' | 'some'

export type PublishResult =
  | { ok: true; id: string }
  | { ok: false; reason: 'verified' | 'graded' | 'unavailable' }

/** App-wide mock scenarios. Seed rows stay in the db; the store filters them. */
export interface DemoScenarios {
  updates: UpdateScenario
  market: MarketScenario
  greenhouse: GreenhouseScenario
  topGreenhouses: TopGreenhouseScenario
  gradeStack: GradeStackScenario
  publishRequirement: PublishRequirement
  marketBanner: MarketBannerScenario
  trades: TradeScenario
}

export interface MockDb {
  users: User[]
  species: Species[]
  catalog: Catalog
  marketClasses: MarketClass[]
  plants: Plant[]
  listings: Listing[]
  orders: Order[]
  offers: Offer[]
  threads: MessageThread[]
  moderation: ModerationItem[]
  claimDrafts: ClaimDraft[]
  updates: FeedUpdate[]
  topGreenhouses: TopGreenhouse[]
  pendingUsers: PendingUser[]
  pendingTransactions: PendingTransaction[]
  currentUserId: string | null
  visitorId: string
  locale: Locale
  flags: DemoScenarios
  feedFriendsOnly: boolean
  /** Admin System: page maintenance and feature release status. */
  system: import('../theme/release').SystemConfig
}
