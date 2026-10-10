import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Catalog, CatalogCategory, CatalogSubcategory, Plant, User } from '../../../src/mock/types.ts'
import { BUILT_IN_TASKS } from '../../../src/features/todo/carePlan.ts'
import { allCareSuggestions } from '../../../src/features/todo/careSuggestions.ts'
import { DEFAULT_SYSTEM, normalizeSystem } from '../../../src/theme/release.ts'
import { explainDbError, getStore } from '../db/index.ts'
import type { PlantxStore } from '../db/store.ts'
import { activityService } from '../features/activity/activity.service.ts'
import type { Activity } from '../features/activity/activity.types.ts'
import { todoService } from '../features/todo/todo.service.ts'
import type { PendingTransaction, PendingUser } from '../features/users/users.types.ts'
import { bootstrapAdminEmail, plantxDb, plantxEnv, plantxEnvLabel, plantxSeed } from './env.ts'
import { logger } from './logger.ts'

/** Default empty-live operator — Gmail SSO only (no password). The email comes from env. */
const BOOTSTRAP_ADMIN: User = {
  id: 'u-admin',
  name: 'Omri',
  nameHe: 'עומרי',
  role: 'admin',
  region: 'Central Israel',
  regionHe: 'מרכז',
  bio: 'PlantX operator.',
  bioHe: 'מפעיל PlantX.',
  rating: 0,
  completedOrders: 0,
  verificationRate: 0,
  cancellations: 0,
  specialties: [],
  specialtiesHe: [],
  avatarColor: '#1FA85A',
  friendIds: [],
  accountStatus: 'active',
}

/** A fresh operator row, with `PLANTX_BOOTSTRAP_ADMIN_EMAIL` when it is set. */
export function bootstrapAdmin(): User {
  const user = structuredClone(BOOTSTRAP_ADMIN)
  const email = bootstrapAdminEmail()
  if (email) user.email = email
  return user
}

/** One catalog photo so an empty world is not a blank catalog. */
const EXAMPLE_CATEGORY: CatalogCategory = {
  id: 'pothos',
  speciesId: 'sp-pothos',
  name: 'Pothos',
  nameHe: 'פוטוס',
  ticker: 'POT',
  photo: '/class-photos/pot-gold-a-xl-mat.jpg',
}

const EXAMPLE_SUBCATEGORY: CatalogSubcategory = {
  id: 'pothos-gold',
  categoryId: 'pothos',
  name: 'Golden',
  nameHe: 'זהוב',
  code: 'GOLD',
}

function fixturesDir() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
  return path.join(root, 'fixtures', 'demo')
}

function readFixture<T>(name: string): T {
  const file = path.join(fixturesDir(), name)
  return JSON.parse(readFileSync(file, 'utf8')) as T
}

async function seedEmpty(store: PlantxStore) {
  await store.system.save(DEFAULT_SYSTEM)
  await store.users.saveAll([bootstrapAdmin()])
  await store.catalog.save({
    categories: [EXAMPLE_CATEGORY],
    subcategories: [EXAMPLE_SUBCATEGORY],
    properties: [],
    careTasks: BUILT_IN_TASKS.map((task) => ({ ...task })),
    careRules: [],
  })
  await store.plants.saveAll([])
  await store.activities.saveAll([])
  await store.todos.saveAll([])
  await store.pendingUsers.saveAll([])
  await store.pendingTransactions.saveAll([])
  logger.info('Seeded empty live data (bootstrap admin, one category, one subcategory)')
}

async function seedDemo(store: PlantxStore) {
  const from = fixturesDir()
  if (!existsSync(from)) {
    throw new Error(`Demo fixtures missing at ${from}. Run: npm run seed:fixtures`)
  }
  await store.system.save(normalizeSystem(readFixture('system.json')))
  await store.users.saveAll(readFixture<User[]>('users.json'))
  // The fixture predates care plans: start from the built-in tasks and the AI suggestions.
  const fixture = readFixture<Catalog>('catalog.json')
  await store.catalog.save({
    ...fixture,
    careTasks: fixture.careTasks ?? BUILT_IN_TASKS.map((task) => ({ ...task })),
    careRules: fixture.careRules ?? allCareSuggestions(fixture.categories.map((item) => item.id)),
  })
  await store.plants.saveAll(readFixture<Plant[]>('plants.json'))
  await store.activities.saveAll(readFixture<Activity[]>('activities.json'))
  await store.todos.saveAll([])
  await store.pendingUsers.saveAll(readFixture<PendingUser[]>('pending-users.json'))
  await store.pendingTransactions.saveAll(readFixture<PendingTransaction[]>('pending-transactions.json'))
  logger.info('Seeded demo fixtures')
}

async function ensureExampleCatalog(store: PlantxStore) {
  if (plantxSeed() === 'demo') return
  const catalog = await store.catalog.get()
  if (catalog.categories.length > 0 && catalog.subcategories.length > 0) return
  const categories = catalog.categories.length > 0 ? catalog.categories : [EXAMPLE_CATEGORY]
  const subcategories =
    catalog.subcategories.length > 0
      ? catalog.subcategories
      : [{ ...EXAMPLE_SUBCATEGORY, categoryId: categories[0].id }]
  await store.catalog.save({ ...catalog, categories, subcategories })
  logger.info('Restored the example category and subcategory')
}

/**
 * Keep one active admin: the row with the bootstrap email (env), else `u-admin`.
 * Without the env var the existing admin row keeps its role and email, and Google grants no admin.
 */
export async function ensureBootstrapAdmin() {
  const store = getStore()
  const users = await store.users.list()
  if (users.length === 0) {
    await store.users.saveAll([bootstrapAdmin()])
    return
  }
  const email = bootstrapAdminEmail()
  let row = email ? users.find((user) => user.email?.toLowerCase() === email) : undefined
  if (!row) {
    row = users.find((user) => user.id === BOOTSTRAP_ADMIN.id)
    if (row && email) {
      row.name = BOOTSTRAP_ADMIN.name
      row.nameHe = BOOTSTRAP_ADMIN.nameHe
      row.bio = BOOTSTRAP_ADMIN.bio
      row.bioHe = BOOTSTRAP_ADMIN.bioHe
    } else if (!row) {
      users.push(bootstrapAdmin())
      row = users[users.length - 1]
    }
  }
  row.role = 'admin'
  row.accountStatus = 'active'
  // Never rewrite an existing admin email at startup: a typo in the env var would lock the operator out.
  // Only a verified Google sign-in with the configured address claims the row (session.service.ts).
  if (email && !row.email) row.email = email
  else if (email && row.email?.toLowerCase() !== email) {
    logger.warn('PLANTX_BOOTSTRAP_ADMIN_EMAIL does not match the admin account; leaving the account email as it is', {
      adminId: row.id,
    })
  }
  if (!row.name) row.name = BOOTSTRAP_ADMIN.name
  if (!row.nameHe) row.nameHe = BOOTSTRAP_ADMIN.nameHe

  if (plantxEnv() !== 'mock') {
    for (const user of users) {
      if (user.id === row?.id) continue
      if (user.role === 'admin') user.role = 'grower'
    }
  }

  await store.users.saveAll(users)
}

/** Drop rows whose foreign keys do not point at a real parent. */
async function pruneBrokenRelations(store: PlantxStore) {
  if (plantxEnv() === 'mock') return
  const users = await store.users.list()
  const userIds = new Set(users.map((user) => user.id))
  let usersChanged = false
  const nextUsers = users.map((user) => {
    const friendIds = (user.friendIds ?? []).filter((id) => userIds.has(id) && id !== user.id)
    if (friendIds.length !== (user.friendIds ?? []).length) {
      usersChanged = true
      return { ...user, friendIds }
    }
    return user
  })
  if (usersChanged) await store.users.saveAll(nextUsers)

  const catalog = await store.catalog.get()
  const categories = new Set(catalog.categories.map((row) => row.id))
  const keptSubs = catalog.subcategories.filter((row) => categories.has(row.categoryId))
  const subIds = new Set(keptSubs.map((row) => row.id))
  const keptProps = catalog.properties.map((row) => ({
    ...row,
    categoryIds: row.categoryIds.filter((id) => categories.has(id)),
    subcategoryIds: row.subcategoryIds.filter((id) => subIds.has(id)),
  }))
  if (
    keptSubs.length !== catalog.subcategories.length ||
    JSON.stringify(keptProps) !== JSON.stringify(catalog.properties)
  ) {
    await store.catalog.save({ ...catalog, subcategories: keptSubs, properties: keptProps })
  }

  const plants = await store.plants.list()
  const keptIds = new Set(plants.filter((plant) => userIds.has(plant.ownerId)).map((plant) => plant.id))
  let plantsChanged = plants.length !== keptIds.size
  const keptPlants = plants
    .filter((plant) => keptIds.has(plant.id))
    .map((plant) => {
      let next = plant
      if (next.parentId && !keptIds.has(next.parentId)) {
        plantsChanged = true
        next = { ...next }
        delete next.parentId
      }
      if (next.subcategoryId && !subIds.has(next.subcategoryId)) {
        plantsChanged = true
        next = { ...next }
        delete next.subcategoryId
      }
      return next
    })
  if (plantsChanged) {
    await store.plants.saveAll(keptPlants)
    if (plants.length !== keptPlants.length) {
      logger.info(`Removed ${plants.length - keptPlants.length} plants with missing owners`)
    }
  }

  const activities = await store.activities.list()
  const keptActivities = activities.filter(
    (row) => userIds.has(row.userId) && (!row.plantId || keptIds.has(row.plantId)),
  )
  if (keptActivities.length !== activities.length) {
    await store.activities.saveAll(keptActivities)
    logger.info(`Removed ${activities.length - keptActivities.length} activities with missing user or plant`)
  }

  const todos = await store.todos.list()
  const keptTodos = todos.filter((row) => userIds.has(row.ownerId) && keptIds.has(row.plantId))
  if (keptTodos.length !== todos.length) {
    await store.todos.saveAll(keptTodos)
    logger.info(`Removed ${todos.length - keptTodos.length} todos with missing owner or plant`)
  }
}

/** Write launch data when this environment has not been seeded. mock → demo fixtures; qa/prod → empty live. */
export async function ensureDataFiles() {
  const store = getStore()
  try {
    if (!(await store.isReady())) {
      if (plantxSeed() === 'demo') await seedDemo(store)
      else await seedEmpty(store)
    }
    await ensureExampleCatalog(store)
    await ensureBootstrapAdmin()
    await pruneBrokenRelations(store)
    try {
      await activityService.ensureMains()
    } catch (err) {
      logger.warn('activity backfill skipped', undefined, err)
    }
    const care = await todoService.ensureCareTodos()
    if (care.added > 0) logger.info('care todos added', care)
  } catch (err) {
    throw explainDbError(err)
  }
  logger.info(`PlantX data ready (${plantxEnvLabel()})`, {
    env: plantxEnv(),
    db: plantxDb(),
    seed: plantxSeed(),
  })
}
