export type Locale = 'he' | 'en'
export type UserRole =
  | 'grower'
  | 'collector'
  | 'business'
  | 'nursery'
  | 'admin'
  | 'guest'

export type QualityGrade = 'S' | 'A' | 'B' | 'C' | 'D'
/** Community swipe on Rank. Separate from catalog health. */
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

/** Admin moderation state. 'deleted' is a soft delete: the row stays and can be restored. */
export type Visibility = 'visible' | 'hidden' | 'deleted'

/** Who last hid, showed, deleted or restored a row, and why. Absent = never moderated. */
export type VisibilityMeta = {
  visibility?: Visibility
  visibilityChangedBy?: string
  visibilityChangedAt?: string
  visibilityReason?: string
}

/** One admin change to a member's AI scans: extra scans for one day, or a new daily limit. */
export type ScanAdjustment = {
  id: string
  userId: string
  /** YYYY-MM-DD, Israel time. */
  day: string
  kind: 'extra' | 'limit'
  /** 'extra': scans added (negative takes away). */
  delta: number
  /** 'limit': the new daily limit; null = back to the default. */
  value: number | null
  reason: string
  createdBy?: string
  createdByName?: string
  createdAt: string
}

/** A member's AI scans today. */
export type ScanQuota = {
  used: number
  /** Daily limit (override or default). */
  limit: number
  /** Admin extras for today (can be negative). */
  extra: number
  remaining: number
  /** ISO time of the next reset (00:00 Israel time). */
  resetsAt: string
}

export type ModerationTarget = 'user' | 'plant' | 'activity'
export type ModerationAction = 'hide' | 'show' | 'delete' | 'restore' | 'edit'

/** What a hide or delete also takes out of view (computed, nothing is rewritten). */
export type ModerationImpact = { plants: number; activities: number; todos: number }

export type ModerationEntry = {
  id: string
  actorId?: string
  actorName?: string
  targetType: ModerationTarget
  targetId: string
  targetLabel?: string
  action: ModerationAction
  reason: string
  cascade: Partial<ModerationImpact>
  createdAt: string
}

export interface User extends VisibilityMeta {
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
  /** Public face. Missing means the seed. */
  avatarIcon?: string
  email?: string
  /** Public name. Replaces the account name wherever other people see this grower. */
  nickname?: string
  friendIds: string[]
  /** Absent means active. Disabled accounts cannot sign in. */
  accountStatus?: 'active' | 'disabled'
  /** Can enter while the public app flag is off. */
  preapproved?: boolean
  /** Admin override of the daily AI scan limit. Absent = the default. */
  dailyScanLimit?: number | null
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

export interface Plant extends VisibilityMeta {
  id: string
  /** Only the owner and admins see a private plant and its activity. Default public. */
  private?: boolean
  code: string
  ownerId: string
  speciesId: string
  marketClassId?: string
  variety?: string
  varietyHe?: string
  subcategoryId?: string
  /** Extra catalog properties. Health, size, and stage stay on the plant fields. */
  traits?: Record<string, string>
  title: string
  titleHe: string
  description?: string
  descriptionHe?: string
  photos: string[]
  quantity: number
  sizeGrade: string
  sizeBand?: SizeBand
  /** Empty until health is chosen. */
  quality: QualityGrade | ''
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
  status: 'owned' | 'listed' | 'sold'
  /** Set by a greenhouse publish. Independent of an active market listing. */
  publishedAt?: string
  grades?: CommunityGrade[]
  /** Overrides the species default when this specimen differs. */
  rarity?: PlantRarity
  growthTime?: GrowthTime
  conditions?: GrowingConditions
  /** How the class was identified when the plant was added. Set by the server from a saved identify request. */
  identification?: PlantIdentification
  createdAt: string
  history: { at: string; label: string; labelHe: string }[]
  comps?: { price: number; date: string; note: string; noteHe: string }[]
}

/**
 * `ai`: a provider answered and the saved class matches its answer.
 * `edited`: a provider answered, then the owner picked a different class.
 * `manual`: no provider answer; the owner filled the class in.
 */
export type PlantIdentificationSource = 'ai' | 'edited' | 'manual'

export type PlantIdentification = {
  source: PlantIdentificationSource
  provider?: IdentifyProviderId
  mode?: IdentifyMode
  label?: string
  scientificName?: string
  probability?: number
  requestId?: string
  at: string
  /** One check per saved photo, in photo order. */
  photos?: PhotoCheck[]
  /**
   * Per class field: did the owner keep the AI value, change it, or fill it with none?
   * `aiValue` is the AI's suggested option id, kept so a changed field can show the
   * original AI answer in a tooltip. Absent on plants added before this was tracked.
   */
  fields?: IdentifyFieldMarks
}

/**
 * `match`: the provider saw the saved class. `mismatch`: it saw another plant or one outside the catalog.
 * `notPlant` / `failed`: no usable answer. `unscanned`: no identify request for this photo.
 */
export type PhotoCheckResult = 'match' | 'mismatch' | 'notPlant' | 'failed' | 'unscanned'

export type PhotoCheck = {
  position: number
  result: PhotoCheckResult
  requestId?: string
  provider?: IdentifyProviderId
  mode?: IdentifyMode
  label?: string
  probability?: number
}

/** Class fields an identify answer can fill. */
export type IdentifyFieldId = 'category' | 'subcategory' | 'quality' | 'size' | 'stage'

/** `kept`: the AI value was saved. `changed`: the owner picked another. `manual`: the AI gave none. */
export type IdentifyFieldCheck = 'kept' | 'changed' | 'manual'

export type IdentifyFieldChecks = Partial<Record<IdentifyFieldId, IdentifyFieldCheck>>

/**
 * One field's provenance on a saved plant: the check plus the AI's suggested option id,
 * so a `changed` field can reveal what the AI had answered. `aiValue` is a catalog option id
 * (or `other` / category speciesId), resolved to a label at render time.
 */
export type IdentifyFieldMark = {
  check: IdentifyFieldCheck
  aiValue?: string
}

export type IdentifyFieldMarks = Partial<Record<IdentifyFieldId, IdentifyFieldMark>> & {
  /** Catalog traits the AI filled (property id → mark), e.g. growth form or variegation. */
  traits?: Record<string, IdentifyFieldMark>
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

/** `scan`: an Add Plant identify call (linked to the plant once it is saved). `added`: a plant joined the greenhouse. */
export type FeedUpdateKind =
  | 'photo'
  | 'water'
  | 'propagate'
  | 'grade'
  | 'passport'
  | 'listing'
  | 'scan'
  | 'added'
  /** The owner (or an admin) changed the plant, or made it private / public. Private to the owner and admins. */
  | 'edited'
  /** The owner deleted the plant. Private; it has no plantId, so it outlives the deleted plant. */
  | 'deleted'

export interface FeedUpdate {
  id: string
  kind: FeedUpdateKind
  userId: string
  plantId?: string
  identifyRequestId?: string
  body: string
  bodyHe: string
  createdAt: string
}

/** Top-level todo bucket. Later: market. */
export type TodoCategory = 'plant'

/** Action under the category. Later under market: verify. */
export type TodoSubcategory = 'water' | 'photo'

export interface Todo {
  id: string
  ownerId: string
  plantId: string
  category: TodoCategory
  subcategory: TodoSubcategory
  /** ISO date YYYY-MM-DD. Null for a first-watering session awaiting a calendar pick. */
  dueOn: string | null
  completedOn: string | null
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

/** Class fields a person confirms before saving. Photo identify can fill this shape. */
export type PlantClassDraft = {
  categoryId: string
  subcategoryId: string
  quality: QualityGrade | ''
  size: SizeBand | ''
  stage: StageBand | ''
  traits: Record<string, string>
}

export type IdentifyProviderId = 'plantnet' | 'gemini'

export type IdentifySkipReason = 'disabled' | 'missingKey' | 'exhausted' | 'error' | 'timeout'

export type IdentifyTried = {
  provider: IdentifyProviderId
  reason: IdentifySkipReason
  detail?: string
}

/** `gate`: is this a plant? `species`: the name. `draft`: catalog fields filled from the live catalog. */
export type IdentifyStepId = 'gate' | 'species' | 'draft'

export type IdentifyStep = {
  id: IdentifyStepId
  provider: IdentifyProviderId
  ok: boolean
  isPlant?: boolean
  label?: string
  scientificName?: string
  probability?: number
  detail?: string
}

export type SuggestedPropertyOption = {
  label: string
  labelHe: string
  sign: string
}

/** One property Gemini proposes for a plant that is not in the catalog yet. */
export type SuggestedProperty = {
  name: string
  nameHe: string
  required: boolean
  inMarketName: boolean
  sign: string
  scope: 'category' | 'subcategory'
  options: SuggestedPropertyOption[]
}

/** Category, subcategory, and properties proposed for one unmatched plant. */
export type CatalogSuggestionDraft = {
  /** A new variety of this existing category. The `category` fields are then only its display copy. */
  categoryId?: string
  category: { name: string; nameHe: string; ticker: string; photo: string }
  subcategory: { name: string; nameHe: string; code: string; photo: string }
  properties: SuggestedProperty[]
}

/**
 * A plant the catalog lacks: from a scan that matched no category (`identify`) or a member's
 * Catalog form (`member`). Admins see every row; a member sees their own open rows as pending.
 */
export type CatalogSuggestion = {
  id: string
  createdAt: string
  name: string
  scientificName: string
  genus: string
  commonNames: string[]
  /** Admin only. Empty in a member's own list. */
  provider: string
  hits: number
  /** `open` is waiting. `added` joined the catalog. `dismissed` was declined. */
  status: 'open' | 'dismissed' | 'added'
  origin: 'identify' | 'member'
  /** User ids who suggested it. A member's own list holds only them. */
  suggestedBy: string[]
  /** What the member wrote for the admin. */
  note: string
  draft: CatalogSuggestionDraft
}

/** The Catalog "Suggest a plant" form. */
export type CatalogSuggestionInput = {
  name: string
  scientificName: string
  /** An existing category this is a variety of. Empty means a new kind of plant. */
  categoryId: string
  note: string
  /** JPEG data URL, optional. */
  photo: string
}

export type Diagnosis = {
  provider: IdentifyProviderId
  mode: IdentifyMode
  label: string
  scientificName: string
  commonNames: string[]
  probability: number
  isPlant: boolean
  draft: Partial<PlantClassDraft>
  tried: IdentifyTried[]
  /** Pipeline runs record the gate, the species call, and the catalog draft. */
  steps?: IdentifyStep[]
}

/** `mock` parses canned provider responses and spends no credits. `live` calls the real APIs. */
export type IdentifyMode = 'mock' | 'live'

/** `chain` is the Add Plant pipeline. A named provider is a single playground test. */
export type IdentifyTarget = 'chain' | IdentifyProviderId

/** Mock-only answer shape, so every Add Plant state can be exercised. */
export type IdentifyMockScenario = 'match' | 'notInCatalog' | 'notPlant' | 'error'

/** Per provider on Add Plant. The playground chooses its own mode per run. */
export type IdentifyResponseMode = 'ready' | 'mock'

/** What a mock catalog match fills in. Empty property values stay unset. */
export type IdentifyMockMatch = {
  categoryId: string
  /** When true, the match includes `subcategoryId`. */
  subcategory: boolean
  subcategoryId: string
  /** Property id → option id, including health, size, stage, and other traits. */
  properties: Record<string, string>
}

export type IdentifyProviderSettings = {
  enabled: boolean
  response: IdentifyResponseMode
  scenario: IdentifyMockScenario
  match: IdentifyMockMatch
  suggestionId: string
  /** Gemini plant-check. Missing means this provider's own response and scenario. */
  gate?: IdentifyProviderSettings
  /** Gemini catalog draft. Missing means this provider's own response and scenario. */
  draft?: IdentifyProviderSettings
}

export type IdentifySource = 'addPlant' | 'playground'

export type IdentifyRequestStatus = 'ok' | 'unavailable'

export type IdentifyRequestRecord = {
  id: string
  createdAt: string
  userId: string
  userName?: string
  source: IdentifySource
  mode: IdentifyMode
  target: IdentifyTarget
  scenario?: IdentifyMockScenario
  status: IdentifyRequestStatus
  /** Small JPEG data URL of the photo that was sent. */
  thumb?: string
  durationMs: number
  diagnosis?: Diagnosis
  tried: IdentifyTried[]
  /** Present on pipeline runs, including ones that stopped early. */
  steps?: IdentifyStep[]
  /** Set when an Add Plant request was saved with a plant. Absent means it was never added. */
  plantId?: string
  photoIndex?: number
  fields?: IdentifyFieldChecks
}

/** One pipeline stage for a playground run. Ready calls the real API. Mock spends nothing. */
export type IdentifyStageRun = {
  response: IdentifyResponseMode
  scenario: IdentifyMockScenario
}

export type IdentifyTestRequest = {
  image: string
  thumb?: string
  mode: IdentifyMode
  target: IdentifyTarget
  scenario?: IdentifyMockScenario
  /** Pipeline only. Each stage is Ready or Mock on its own. */
  stages?: Partial<Record<IdentifyStepId, IdentifyStageRun>>
}

export type IdentifyProviderStatusKind = 'ready' | 'missingKey' | 'exhausted' | 'unreachable'

export type IdentifyCredits = {
  remaining?: number
  used?: number
  total?: number
  period?: 'day' | 'week' | 'month' | 'total'
}

export type IdentifyProviderStatus = {
  id: IdentifyProviderId
  order: number
  name: string
  returns: string
  docsUrl: string
  keySet: boolean
  /** Admin switch. Add Plant skips a disabled provider; the playground ignores it. */
  enabled: boolean
  /** `ready` calls the real API. `mock` answers with `scenario` and spends nothing. */
  response: IdentifyResponseMode
  scenario: IdentifyMockScenario
  /** Used when `scenario` is `match`. */
  match: IdentifyMockMatch
  /** Used when `scenario` is `notInCatalog`. Empty means the built-in example plant. */
  suggestionId: string
  status: IdentifyProviderStatusKind
  credits?: IdentifyCredits
  model?: string
  lastError?: string
  lastUsedAt?: string
  /** Gemini plant check. Absent means this provider's own response. */
  gate?: IdentifyProviderSettings
  /** Gemini catalog draft. Absent means this provider's own response. */
  draft?: IdentifyProviderSettings
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
  todos: Todo[]
  topGreenhouses: TopGreenhouse[]
  /** Admin-verified greenhouse owners, at most three. Absent until an admin verifies one. */
  verifiedGreenhouseIds?: string[] | null
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
