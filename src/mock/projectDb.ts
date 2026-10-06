import { normalizeScenarios } from './session'
import type {
  DemoScenarios,
  FeedUpdate,
  Listing,
  MarketClass,
  MockDb,
  Order,
  Plant,
  TopGreenhouse,
} from './types'

const SOME_LISTINGS = 4
const SEVERAL_PLANTS = 4
const HIDDEN_OWNER = 'demo-unassigned'

/** Hide, trim, or duplicate seed rows. The stored db is left intact. */
export function projectDb(db: MockDb): MockDb {
  const flags = normalizeScenarios(db.flags)
  const viewer = db.currentUserId ?? db.visitorId
  const admin = db.users.some((user) => user.id === viewer && user.role === 'admin')
  const reachable = reachablePlants(db.plants, viewer, admin)
  const updates = selectUpdates(
    (db.updates ?? []).filter((item) => !item.plantId || reachable.has(item.plantId) || !db.plants.some((plant) => plant.id === item.plantId)),
    flags.updates,
  )
  const topGreenhouses = selectTopGreenhouses(db.topGreenhouses ?? [], flags.topGreenhouses)
  const market = projectMarket(db, flags.market)
  const plants = projectPlants(db.plants.filter((plant) => reachable.has(plant.id)), viewer, flags.greenhouse, market.comps, market.plantIds)

  return {
    ...db,
    flags,
    updates,
    topGreenhouses,
    listings: market.listings,
    marketClasses: market.classes,
    orders: market.orders,
    plants,
    todos: db.todos.filter((todo) => !todo.plantId || reachable.has(todo.plantId) || !db.plants.some((plant) => plant.id === todo.plantId)),
  }
}

/**
 * Plants this viewer may reach, the server's rules in mock mode (server/src/lib/visibility.ts): another
 * grower's private plant, and a deleted plant, are gone unless the viewer is an admin. Their activity and
 * tasks go with them.
 */
function reachablePlants(plants: Plant[], viewer: string, admin: boolean) {
  return new Set(
    plants
      .filter((plant) => admin || ((!plant.private || plant.ownerId === viewer) && plant.visibility !== 'deleted'))
      .map((plant) => plant.id),
  )
}

function selectUpdates(updates: FeedUpdate[], scenario: DemoScenarios['updates']): FeedUpdate[] {
  const ordered = [...updates].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  if (scenario === 'empty') return []
  if (scenario === 'one') return ordered.slice(0, 1)
  if (scenario === 'multiple') return ordered.slice(0, 3)
  return ordered
}

function selectTopGreenhouses(rows: TopGreenhouse[], scenario: DemoScenarios['topGreenhouses']): TopGreenhouse[] {
  const ranked = [...rows].sort((a, b) => b.grade - a.grade || a.id.localeCompare(b.id))
  if (scenario === 'empty') return []
  if (scenario === 'single') return ranked.slice(0, 1)
  const top = ranked.slice(0, 3)
  if (scenario === 'tied' && top[0]) return top.map((row) => ({ ...row, grade: top[0].grade }))
  return top
}

function projectMarket(db: MockDb, scenario: DemoScenarios['market']) {
  if (scenario === 'none') {
    return { listings: [] as Listing[], classes: [] as MarketClass[], orders: [] as Order[], comps: 'none' as const, plantIds: new Set<string>() }
  }
  if (scenario === 'prices') {
    return { listings: [] as Listing[], classes: db.marketClasses, orders: [] as Order[], comps: 'none' as const, plantIds: new Set<string>() }
  }
  if (scenario === 'listings') {
    return {
      listings: db.listings,
      classes: [] as MarketClass[],
      orders: db.orders,
      comps: 'all' as const,
      plantIds: new Set(db.listings.map((listing) => listing.plantId)),
    }
  }

  const listings =
    scenario === 'one'
      ? db.listings.slice(0, 1)
      : scenario === 'some'
        ? someListings(db)
        : scenario === 'category'
          ? listingsForSpecies(db, dominantSpecies(db))
          : db.listings

  const speciesId = scenario === 'category' ? dominantSpecies(db) : null
  const classes =
    speciesId != null
      ? db.marketClasses.filter((item) => item.speciesId === speciesId)
      : scenario === 'mixed' || scenario === 'pages'
        ? db.marketClasses
        : classesForListings(db, listings)

  const plantIds = new Set(listings.map((listing) => listing.plantId))
  const orders =
    scenario === 'mixed' || scenario === 'pages' ? db.orders : ordersForListings(db.orders, listings, plantIds)

  return {
    listings,
    classes,
    orders,
    comps: scenario === 'mixed' || scenario === 'pages' ? ('all' as const) : ('some' as const),
    plantIds,
  }
}

function someListings(db: MockDb): Listing[] {
  const picked: Listing[] = []
  const seen = new Set<string>()
  for (const listing of db.listings) {
    const species = speciesOf(db, listing)
    if (species && seen.has(species)) continue
    if (species) seen.add(species)
    picked.push(listing)
    if (picked.length >= SOME_LISTINGS) break
  }
  for (const listing of db.listings) {
    if (picked.length >= SOME_LISTINGS) break
    if (picked.some((item) => item.id === listing.id)) continue
    picked.push(listing)
  }
  return picked
}

function dominantSpecies(db: MockDb): string | null {
  const counts = new Map<string, number>()
  for (const listing of db.listings) {
    const species = speciesOf(db, listing)
    if (!species) continue
    counts.set(species, (counts.get(species) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? db.species[0]?.id ?? null
}

function listingsForSpecies(db: MockDb, speciesId: string | null): Listing[] {
  if (!speciesId) return []
  return db.listings.filter((listing) => speciesOf(db, listing) === speciesId)
}

function speciesOf(db: MockDb, listing: Listing) {
  return db.plants.find((plant) => plant.id === listing.plantId)?.speciesId
}

function classesForListings(db: MockDb, listings: Listing[]): MarketClass[] {
  const ids = new Set<string>()
  for (const listing of listings) {
    if (listing.marketClassId) ids.add(listing.marketClassId)
    const plant = db.plants.find((item) => item.id === listing.plantId)
    if (plant?.marketClassId) ids.add(plant.marketClassId)
  }
  const matched = db.marketClasses.filter((item) => ids.has(item.id))
  return matched.length ? matched : db.marketClasses.slice(0, Math.min(3, db.marketClasses.length))
}

function ordersForListings(orders: Order[], listings: Listing[], plantIds: Set<string>): Order[] {
  const listingIds = new Set(listings.map((listing) => listing.id))
  return orders.filter(
    (order) =>
      (order.listingId != null && listingIds.has(order.listingId)) ||
      order.items.some((item) => plantIds.has(item.plantId)),
  )
}

function projectPlants(
  plants: Plant[],
  viewer: string,
  scenario: DemoScenarios['greenhouse'],
  comps: 'all' | 'none' | 'some',
  plantIds: Set<string>,
): Plant[] {
  const collected = applyGreenhouse(plants, viewer, scenario)
  if (comps === 'all') return collected
  if (comps === 'none') return collected.map((plant) => (plant.comps?.length ? { ...plant, comps: [] } : plant))
  return collected.map((plant) =>
    plantIds.has(plant.id) || !plant.comps?.length ? plant : { ...plant, comps: [] },
  )
}

function applyGreenhouse(plants: Plant[], viewer: string, scenario: DemoScenarios['greenhouse']): Plant[] {
  const mine = plants.filter((plant) => plant.ownerId === viewer)
  if (scenario === 'empty') {
    return plants.map((plant) => (plant.ownerId === viewer ? { ...plant, ownerId: HIDDEN_OWNER } : plant))
  }
  const cap = scenario === 'one' ? 1 : scenario === 'several' ? SEVERAL_PLANTS : mine.length
  const keep = new Set(
    (scenario === 'listed' ? mine.filter((plant) => plant.status === 'listed') : mine.slice(0, cap)).map(
      (plant) => plant.id,
    ),
  )
  return plants.map((plant) =>
    plant.ownerId === viewer && !keep.has(plant.id) ? { ...plant, ownerId: HIDDEN_OWNER } : plant,
  )
}
