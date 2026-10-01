import type { User, Plant, FeedUpdate, CatalogSubcategory, CatalogProperty } from '../../../src/mock/types.ts'
import { DEFAULT_SYSTEM } from '../../../src/theme/release.ts'
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { plantxEnv, plantxEnvLabel, plantxSeed } from './env.ts'
import { fileExists, hasDataFiles, readJson, writeJson, dataDir } from './jsonStore.ts'
import { logger } from './logger.ts'

/** Default empty-live operator — Gmail SSO only (no password). */
export const BOOTSTRAP_ADMIN: User = {
  id: 'u-admin',
  name: 'Omri',
  nameHe: 'עומרי',
  email: 'omri96david@gmail.com',
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

function fixturesDir() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
  return path.join(root, 'fixtures', 'demo')
}

function seedMode(): 'empty' | 'demo' {
  return plantxSeed()
}

function copyDemoFixtures() {
  const from = fixturesDir()
  const to = dataDir
  if (!existsSync(from)) {
    throw new Error(`Demo fixtures missing at ${from}. Run: npm run seed:fixtures`)
  }
  mkdirSync(to, { recursive: true })
  for (const name of readdirSync(from)) {
    if (!name.endsWith('.json')) continue
    copyFileSync(path.join(from, name), path.join(to, name))
  }
  logger.info(`Seeded ${to} from fixtures/demo (local example mocks)`)
}

function writeEmptyLive() {
  writeJson('system.json', DEFAULT_SYSTEM)
  writeJson('users.json', [structuredClone(BOOTSTRAP_ADMIN)])
  writeJson('plants.json', [])
  writeJson('activities.json', [])
  writeJson('catalog-categories.json', [])
  writeJson('catalog-subcategories.json', [])
  writeJson('catalog-properties.json', [])
  writeJson('pending-users.json', [])
  writeJson('pending-transactions.json', [])
  logger.info('Seeded empty live data (bootstrap admin only)')
}

/** Always keep the bootstrap Gmail as the sole active admin (empty or demo). */
export function ensureBootstrapAdmin() {
  if (!fileExists('users.json')) {
    writeJson('users.json', [structuredClone(BOOTSTRAP_ADMIN)])
    return
  }
  const users = readJson<User[]>('users.json', [])
  const email = (BOOTSTRAP_ADMIN.email ?? '').toLowerCase()
  let row = users.find((user) => user.email?.toLowerCase() === email)
  if (!row) {
    row = users.find((user) => user.id === 'u-admin')
    if (row) {
      row.name = BOOTSTRAP_ADMIN.name
      row.nameHe = BOOTSTRAP_ADMIN.nameHe
      row.email = BOOTSTRAP_ADMIN.email
      row.role = 'admin'
      row.accountStatus = 'active'
      row.bio = BOOTSTRAP_ADMIN.bio
      row.bioHe = BOOTSTRAP_ADMIN.bioHe
    } else {
      users.push(structuredClone(BOOTSTRAP_ADMIN))
      row = users[users.length - 1]
    }
  } else {
    row.role = 'admin'
    row.accountStatus = 'active'
    row.email = BOOTSTRAP_ADMIN.email
    if (!row.name) row.name = BOOTSTRAP_ADMIN.name
    if (!row.nameHe) row.nameHe = BOOTSTRAP_ADMIN.nameHe
  }

  // qa/prod: this Gmail is the only admin. Mock keeps the example persona roles.
  if (plantxEnv() !== 'mock') {
    for (const user of users) {
      if (user.id === row?.id) continue
      if (user.role === 'admin') user.role = 'grower'
    }
  }

  writeJson('users.json', users)
}

/** Drop rows whose foreign keys do not point at a real parent. */
function pruneBrokenRelations() {
  if (plantxEnv() === 'mock') return
  const users = readJson<User[]>('users.json', [])
  const userIds = new Set(users.map((user) => user.id))

  const plants = readJson<Plant[]>('plants.json', [])
  const keptPlants = plants.filter((plant) => userIds.has(plant.ownerId))
  if (keptPlants.length !== plants.length) {
    writeJson('plants.json', keptPlants)
    logger.info(`Removed ${plants.length - keptPlants.length} plants with missing owners`)
  }
  const plantIds = new Set(keptPlants.map((plant) => plant.id))

  const activities = readJson<FeedUpdate[]>('activities.json', [])
  const keptActivities = activities.filter(
    (row) => userIds.has(row.userId) && (!row.plantId || plantIds.has(row.plantId)),
  )
  if (keptActivities.length !== activities.length) {
    writeJson('activities.json', keptActivities)
    logger.info(`Removed ${activities.length - keptActivities.length} activities with missing user or plant`)
  }

  const categories = new Set(readJson<{ id: string }[]>('catalog-categories.json', []).map((row) => row.id))
  const subcategories = readJson<CatalogSubcategory[]>('catalog-subcategories.json', [])
  const keptSubs = subcategories.filter((row) => categories.has(row.categoryId))
  if (keptSubs.length !== subcategories.length) writeJson('catalog-subcategories.json', keptSubs)
  const subIds = new Set(keptSubs.map((row) => row.id))

  const properties = readJson<CatalogProperty[]>('catalog-properties.json', [])
  const keptProps = properties.map((row) => ({
    ...row,
    categoryIds: row.categoryIds.filter((id) => categories.has(id)),
    subcategoryIds: row.subcategoryIds.filter((id) => subIds.has(id)),
  }))
  if (JSON.stringify(keptProps) !== JSON.stringify(properties)) writeJson('catalog-properties.json', keptProps)
}

function ensureAccessAndCatalog() {
  if (!fileExists('pending-users.json')) writeJson('pending-users.json', [])
  if (!fileExists('pending-transactions.json')) writeJson('pending-transactions.json', [])
  const split =
    fileExists('catalog-categories.json') ||
    fileExists('catalog-subcategories.json') ||
    fileExists('catalog-properties.json')
  if (!split && !fileExists('catalog.json')) {
    writeJson('catalog-categories.json', [])
    writeJson('catalog-subcategories.json', [])
    writeJson('catalog-properties.json', [])
  }
}

/** Write launch JSON files when the data folder is empty. mock → demo fixtures; qa/prod → empty live. */
export function ensureDataFiles() {
  if (!hasDataFiles()) {
    if (seedMode() === 'demo') copyDemoFixtures()
    else writeEmptyLive()
  }
  ensureAccessAndCatalog()
  ensureBootstrapAdmin()
  pruneBrokenRelations()
  logger.info(`PlantX data ready (${plantxEnvLabel()})`, {
    env: plantxEnv(),
    seed: seedMode(),
  })
}
