import { seedTopGreenhouses } from './topGreenhouses'
import { seedUpdates } from './updates'
import { defaultPlantPhoto, plantImages } from './images'
import { hydrateLocations } from './locations'
import { ensureCommunityGrades } from './communityGrades'
import { PLANT_FACT_OVERRIDES } from './plantFacts'
import { ensureCatalog } from './catalog'
import { personaFlags } from './personas'
import { createSeed } from './seed'
import { normalizeSystem } from '../theme/release'
import { backfillTodos } from '../features/todo/todoSchedule'
import type { DemoScenarios, MarketClass, MockDb, User } from './types'

const VISITOR_COOKIE = 'plantx_visitor'
const ACCOUNT_COOKIE = 'plantx_account'

/** New, unverified, three rich greenhouses, and admin. Guest is signed out. */
export const DEMO_PERSONA_IDS = ['u-ari', 'u-noa', 'u-maya', 'u-daniel', 'u-gal', 'u-dana'] as const

const DEMO_FRIENDS: Record<string, string[]> = {
  'u-ari': [],
  'u-maya': ['u-daniel', 'u-gal'],
  'u-daniel': ['u-maya', 'u-noa'],
  'u-gal': ['u-maya', 'u-noa'],
  'u-noa': ['u-daniel', 'u-gal'],
  'u-dana': ['u-maya', 'u-daniel', 'u-gal', 'u-noa'],
}

const DEMO_EMAILS: Record<string, string> = {
  'u-ari': 'ari@plantx.dev',
  'u-maya': 'maya@plantx.dev',
  'u-daniel': 'daniel@plantx.dev',
  'u-noa': 'noa@plantx.dev',
  'u-gal': 'gal@plantx.dev',
  'u-dana': 'dana@plantx.dev',
}

/** Fold retired demo accounts into a persona that still exists. */
const RETIRED_USER_IDS: Record<string, string> = {
  'u-yael': 'u-noa',
  'u-new': 'u-ari',
}

const DEFAULT_FLAGS: DemoScenarios = {
  updates: 'mixed',
  market: 'mixed',
  greenhouse: 'mixed',
  topGreenhouses: 'ranked',
  gradeStack: 'full',
  publishRequirement: 'none',
  marketBanner: 'full',
  trades: 'some',
}

const UPDATE_SCENARIOS = ['empty', 'one', 'multiple', 'mixed'] as const
const MARKET_SCENARIOS = ['none', 'one', 'some', 'pages', 'mixed', 'category', 'prices', 'listings'] as const
const GREENHOUSE_SCENARIOS = ['empty', 'one', 'several', 'mixed', 'listed'] as const
const TOP_SCENARIOS = ['empty', 'ranked', 'tied', 'single'] as const
const GRADE_STACK_SCENARIOS = ['empty', 'one', 'few', 'full'] as const
const PUBLISH_REQUIREMENTS = ['none', 'verified', 'graded'] as const
const BANNER_SCENARIOS = ['empty', 'few', 'full'] as const
const TRADE_SCENARIOS = ['none', 'one', 'some'] as const

function asScenario<T extends string>(
  value: unknown,
  allowed: readonly T[],
  whenTrue: T,
  whenFalse: T,
  fallback: T,
): T {
  if (value === true) return whenTrue
  if (value === false) return whenFalse
  if (typeof value === 'string' && (allowed as readonly string[]).includes(value)) return value as T
  return fallback
}

export function normalizeScenarios(flags: Partial<DemoScenarios> | undefined): DemoScenarios {
  const raw = flags as Record<string, unknown> | undefined
  return {
    updates: asScenario(raw?.updates, UPDATE_SCENARIOS, 'mixed', 'empty', DEFAULT_FLAGS.updates),
    market: asScenario(raw?.market, MARKET_SCENARIOS, 'mixed', 'none', DEFAULT_FLAGS.market),
    greenhouse: asScenario(raw?.greenhouse, GREENHOUSE_SCENARIOS, 'mixed', 'empty', DEFAULT_FLAGS.greenhouse),
    topGreenhouses: asScenario(raw?.topGreenhouses, TOP_SCENARIOS, 'ranked', 'empty', DEFAULT_FLAGS.topGreenhouses),
    gradeStack: asScenario(raw?.gradeStack, GRADE_STACK_SCENARIOS, 'few', 'empty', DEFAULT_FLAGS.gradeStack),
    publishRequirement: asScenario(
      raw?.publishRequirement,
      PUBLISH_REQUIREMENTS,
      'none',
      'none',
      DEFAULT_FLAGS.publishRequirement,
    ),
    marketBanner: asScenario(raw?.marketBanner, BANNER_SCENARIOS, 'full', 'empty', DEFAULT_FLAGS.marketBanner),
    trades: asScenario(raw?.trades, TRADE_SCENARIOS, 'some', 'none', DEFAULT_FLAGS.trades),
  }
}

export function demoPersonas(users: User[]) {
  return DEMO_PERSONA_IDS.flatMap((id) => {
    const user = users.find((item) => item.id === id)
    return user ? [user] : []
  })
}

function readCookie(name: string) {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function writeCookie(name: string, value: string | null) {
  if (typeof document === 'undefined') return
  if (!value) {
    document.cookie = `${name}=; path=/; max-age=0; samesite=lax`
    return
  }
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax`
}

function mapUserId(id: string) {
  return RETIRED_USER_IDS[id] ?? id
}

function mapUserIds(ids: string[]) {
  return [...new Set(ids.map(mapUserId))]
}

function retireDemoUsers(db: MockDb) {
  const retired = new Set(Object.keys(RETIRED_USER_IDS))
  for (const plant of db.plants ?? []) {
    plant.ownerId = mapUserId(plant.ownerId)
    if (plant.verifiedBy) plant.verifiedBy = mapUserId(plant.verifiedBy)
  }
  for (const listing of db.listings ?? []) listing.sellerId = mapUserId(listing.sellerId)
  for (const order of db.orders ?? []) {
    order.buyerId = mapUserId(order.buyerId)
    order.sellerIds = mapUserIds(order.sellerIds ?? [])
  }
  for (const offer of db.offers ?? []) {
    offer.fromUserId = mapUserId(offer.fromUserId)
    offer.toUserId = mapUserId(offer.toUserId)
  }
  for (const thread of db.threads ?? []) {
    thread.participants = mapUserIds(thread.participants ?? [])
    for (const message of thread.messages ?? []) message.fromUserId = mapUserId(message.fromUserId)
  }
  for (const draft of db.claimDrafts ?? []) {
    if (draft.claimedBy) draft.claimedBy = mapUserId(draft.claimedBy)
  }
  for (const update of db.updates ?? []) {
    update.userId = mapUserId(update.userId)
  }
  db.users = (db.users ?? []).filter((user) => !retired.has(user.id))
  if (db.currentUserId && retired.has(db.currentUserId)) {
    db.currentUserId = mapUserId(db.currentUserId)
  }
}

/** Saved demos can still hold the removed events and demand collections. */
function dropRetiredFeatures(db: MockDb) {
  const legacy = db as MockDb & Record<string, unknown>
  delete legacy.demands
  delete legacy.commitments
  delete legacy.events
  db.plants = db.plants.filter((plant) => !plant.id.startsWith('pl-event-'))
  for (const plant of db.plants) {
    const status = plant.status as string
    if (status === 'committed' || status === 'event') plant.status = 'owned'
    if (status === 'recovered') plant.status = 'sold'
  }
  db.orders = (db.orders ?? []).filter((order) => order.id !== 'or-event-hall')
}

const RETIRED_SPECIES_IDS = new Set(['sp-maple', 'sp-philodendron', 'sp-palm', 'sp-olive', 'sp-mix'])

function stalePhoto(photo: string) {
  return (
    photo.startsWith('http') ||
    photo.includes('unsplash') ||
    photo.includes('map-clump') ||
    photo.includes('pot-mq')
  )
}

/** Drop saved maple/palm/philodendron rows and point photos at the local class files. */
function alignLiveCatalog(db: MockDb) {
  const seed = createSeed()
  const liveSpecies = new Set(seed.species.map((item) => item.id))
  db.species = [
    ...seed.species.map((item) => structuredClone(item)),
    ...db.species.filter((item) => !liveSpecies.has(item.id) && !RETIRED_SPECIES_IDS.has(item.id)),
  ]
  db.marketClasses = seed.marketClasses.map((item) => structuredClone(item))
  const classPhoto = new Map(db.marketClasses.map((item) => [item.id, item.photo]))
  db.plants = db.plants.filter((plant) => !RETIRED_SPECIES_IDS.has(plant.speciesId))
  for (const plant of db.plants) {
    const fallback = classPhoto.get(plant.marketClassId ?? '') ?? defaultPlantPhoto
    const photos = plant.photos.map((photo) => (stalePhoto(photo) ? fallback : photo))
    plant.photos = photos.length ? [...new Set(photos)] : [fallback]
  }
  const plantIds = new Set(db.plants.map((plant) => plant.id))
  db.listings = db.listings.filter((listing) => plantIds.has(listing.plantId))
  const listingIds = new Set(db.listings.map((listing) => listing.id))
  db.offers = (db.offers ?? []).filter((offer) => listingIds.has(offer.listingId))
  db.claimDrafts = (db.claimDrafts ?? []).filter((draft) => !RETIRED_SPECIES_IDS.has(draft.speciesId))
  for (const user of db.users) {
    const seeded = seed.users.find((item) => item.id === user.id)
    if (!seeded || !(DEMO_PERSONA_IDS as readonly string[]).includes(user.id)) continue
    user.bio = seeded.bio
    user.bioHe = seeded.bioHe
    user.specialties = [...seeded.specialties]
    user.specialtiesHe = [...seeded.specialtiesHe]
  }
  db.topGreenhouses = seedTopGreenhouses()
  const staleCopy = /maple|philodendron|kentia|fiddle|olive|אדר|פילודנדרון|קנטיה|כינור|זית/i
  const liveUpdateKinds = new Set(['photo', 'water', 'propagate', 'grade', 'passport', 'listing', 'scan', 'added'])
  const staleUpdatePeople = /Milo|Gal |Noa |Luna|Ruby|מילו|גל |נועה|לונה|רובי/
  if (
    (db.updates ?? []).some(
      (item) =>
        staleCopy.test(item.body) ||
        staleUpdatePeople.test(item.body) ||
        !liveUpdateKinds.has(item.kind),
    )
  ) {
    db.updates = seedUpdates()
  }
}

export function ensureSession(db: MockDb) {
  if (!db.visitorId) {
    db.visitorId = readCookie(VISITOR_COOKIE) || `visitor-${Date.now().toString(36)}`
  }
  if (!Array.isArray(db.updates)) db.updates = seedUpdates()
  if (!Array.isArray(db.todos)) db.todos = []
  if (!Array.isArray(db.topGreenhouses)) db.topGreenhouses = seedTopGreenhouses()
  const legacy = db as MockDb & { pinnedGreenhouseIds?: string[] | null }
  if (!Array.isArray(db.verifiedGreenhouseIds) && Array.isArray(legacy.pinnedGreenhouseIds)) {
    db.verifiedGreenhouseIds = legacy.pinnedGreenhouseIds
  }
  delete legacy.pinnedGreenhouseIds
  if (!Array.isArray(db.pendingUsers)) db.pendingUsers = createSeed().pendingUsers
  if (!Array.isArray(db.pendingTransactions)) db.pendingTransactions = createSeed().pendingTransactions
  delete (db as MockDb & { posts?: unknown }).posts
  retireDemoUsers(db)
  dropRetiredFeatures(db)
  if (typeof db.feedFriendsOnly !== 'boolean') db.feedFriendsOnly = false
  for (const user of db.users) {
    if (!user.email && DEMO_EMAILS[user.id]) user.email = DEMO_EMAILS[user.id]
    user.friendIds = DEMO_FRIENDS[user.id] ?? user.friendIds ?? []
  }
  alignLiveCatalog(db)
  const stalePhotos = new Set(['pl-cfg-pot-gold-a-s-r', 'pl-cfg-pot-njoy-b-m-est', 'pl-maya-batch'])
  for (const plant of db.plants) {
    if (plant.status !== 'listed' || plant.photoAt) continue
    plant.photoAt = stalePhotos.has(plant.id) ? '2026-09-10' : '2026-09-28'
  }
  const filled = backfillTodos(db.plants, db.todos)
  db.plants = filled.plants
  db.todos = filled.todos
  // Demo: a few listed plants keep an overdue photo todo so Needs care has rows.
  for (const plant of db.plants) {
    if (!stalePhotos.has(plant.id)) continue
    const open = db.todos.find(
      (row) => row.plantId === plant.id && row.subcategory === 'photo' && row.completedOn == null,
    )
    if (open) open.dueOn = '2026-09-10'
  }
  for (const item of db.marketClasses) delete (item as MarketClass & { history?: unknown }).history
  const galleryPhotos: Record<string, readonly string[]> = {
    'pl-maya-mother': [plantImages.pothos, plantImages.pothosL, plantImages.pothosCutting],
    'pl-daniel-monstera': [plantImages.monsteraXl, plantImages.monstera, plantImages.leaves],
    'pl-gal-monstera': [plantImages.monstera, plantImages.monsteraXl, plantImages.leaves],
    'pl-gal-pothos': [plantImages.cuttings, plantImages.pothos, plantImages.pothosL, plantImages.pothosCutting],
    'pl-draft-target': [plantImages.pothosNjoy, plantImages.pothosCutting, plantImages.pot],
    'pl-dana-pothos': [plantImages.pothos, plantImages.pothosL],
    'pl-dana-njoy': [plantImages.pothosNjoy],
    'pl-dana-monstera': [plantImages.monstera, plantImages.monsteraXl],
  }
  for (const plant of db.plants) {
    const photos = galleryPhotos[plant.id]
    if (photos && plant.photos.length < photos.length) plant.photos = [...photos]
  }
  const galPothos = db.plants.find((plant) => plant.id === 'pl-gal-pothos')
  if (galPothos) galPothos.status = 'listed'
  const seedSpecies = db.species.some((item) => !item.rarity || !item.growthTime || !item.conditions)
    ? createSeed().species
    : []
  for (const item of db.species) {
    const seeded = seedSpecies.find((entry) => entry.id === item.id)
    if (!seeded) continue
    item.rarity ??= seeded.rarity
    item.growthTime ??= seeded.growthTime
    item.conditions ??= seeded.conditions
  }
  for (const plant of db.plants) {
    const override = PLANT_FACT_OVERRIDES[plant.id]
    if (override && !plant.conditions) Object.assign(plant, override)
  }
  ensureCommunityGrades(
    db.plants,
    (db.listings ?? []).filter((listing) => listing.status !== 'draft').map((listing) => listing.plantId),
  )
  ensureCatalog(db)
  db.flags = personaFlags(db.currentUserId)
  db.system = normalizeSystem(db.system)
  const marked = db as MockDb & { catalogOpened?: boolean }
  if (!marked.catalogOpened) {
    const wiki = db.system.features.wiki
    if (db.system.pages.wiki === 'maintenance' && !wiki.enabled && wiki.status === 'comingSoon') {
      db.system.pages.wiki = 'live'
      db.system.features.wiki = { enabled: true, status: 'ready' }
    }
    marked.catalogOpened = true
  }
  writeCookie(VISITOR_COOKIE, db.visitorId)
  const account = db.users.find((u) => u.id === db.currentUserId && u.role !== 'guest')
  writeCookie(ACCOUNT_COOKIE, account?.email ?? account?.id ?? null)
  return hydrateLocations(db)
}
