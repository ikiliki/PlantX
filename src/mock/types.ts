export type Locale = 'he' | 'en'
export type UserRole =
  | 'grower'
  | 'collector'
  | 'business'
  | 'nursery'
  | 'event'
  | 'admin'
  | 'guest'

export type QualityGrade = 'A' | 'B' | 'C'
export type SizeBand = 'S' | 'M' | 'L' | 'XL'
export type StageBand = 'CUT' | 'ROOTED' | 'EST' | 'MATURE'
export type RootingStatus = 'rooted' | 'unrooted' | 'established'
export type ListingStatus = 'active' | 'reserved' | 'sold' | 'draft'
export type DemandStatus = 'open' | 'sourcing' | 'confirmed' | 'fulfilled' | 'cancelled'
export type CommitmentStatus = 'pending' | 'accepted' | 'rejected' | 'fulfilled' | 'cancelled'
export type OrderStatus =
  | 'intent'
  | 'confirmed'
  | 'handoff'
  | 'completed'
  | 'disputed'
  | 'cancelled'
export type EventPhase = 'sourcing' | 'confirmed' | 'in_use' | 'recovery' | 'graded' | 'redistributed'
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
  bio: string
  bioHe: string
  rating: number
  completedOrders: number
  verificationRate: number
  cancellations: number
  specialties: string[]
  specialtiesHe: string[]
  avatarColor: string
}

export interface Species {
  id: string
  commonName: string
  commonNameHe: string
  scientificName: string
  fungibility: 'common' | 'premium'
  ticker: string
}

export interface Plant {
  id: string
  code: string
  ownerId: string
  speciesId: string
  marketClassId?: string
  variety?: string
  varietyHe?: string
  title: string
  titleHe: string
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
  parentId?: string
  batchId?: string
  propagatedAt?: string
  verifiedAt?: string
  verifiedBy?: string
  status: 'owned' | 'listed' | 'committed' | 'sold' | 'event' | 'recovered'
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
  history: { t: string; price: number }[]
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

export interface DemandRequest {
  id: string
  buyerId: string
  title: string
  titleHe: string
  speciesId: string
  marketClassId?: string
  targetQty: number
  committedQty: number
  minSupplierQty: number
  priceMin: number
  priceMax: number
  quality: QualityGrade[]
  region: string
  regionHe: string
  dueDate: string
  status: DemandStatus
  notes: string
  notesHe: string
  createdAt: string
}

export interface SupplyCommitment {
  id: string
  demandId: string
  growerId: string
  quantity: number
  offeredPrice: number
  quality: QualityGrade
  availableDate: string
  status: CommitmentStatus
  plantId?: string
}

export interface Order {
  id: string
  buyerId: string
  sellerIds: string[]
  listingId?: string
  demandId?: string
  eventId?: string
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
  relatedDemandId?: string
  messages: {
    id: string
    fromUserId: string
    body: string
    bodyHe: string
    at: string
  }[]
}

export interface EventProject {
  id: string
  buyerId: string
  name: string
  nameHe: string
  venue: string
  venueHe: string
  eventDate: string
  phase: EventPhase
  orderId?: string
  required: { speciesId: string; qty: number; use: string; useHe: string }[]
  recovered: {
    plantId: string
    grade: QualityGrade | 'lost' | 'damaged'
    notes: string
    notesHe: string
  }[]
  redistributedTo?: string
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

export interface MockDb {
  users: User[]
  species: Species[]
  marketClasses: MarketClass[]
  plants: Plant[]
  listings: Listing[]
  demands: DemandRequest[]
  commitments: SupplyCommitment[]
  orders: Order[]
  offers: Offer[]
  threads: MessageThread[]
  events: EventProject[]
  moderation: ModerationItem[]
  claimDrafts: ClaimDraft[]
  currentUserId: string | null
  locale: Locale
}
