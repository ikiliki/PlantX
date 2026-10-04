/**
 * Preprod only. Wipes the preprod database and starts over:
 *   - the bootstrap admin (u-admin) and default system settings,
 *   - the catalog copied from CATALOG_SOURCE_URL (production), read in a READ ONLY transaction,
 *   - test-user-001 … test-user-NNN with nothing else (emails @preprod.invalid).
 *
 *   PREPROD_DATABASE_URL=... CATALOG_SOURCE_URL=... npm run seed:preprod -- --users 20
 *
 * Reads PREPROD_DATABASE_URL only, and refuses when it equals DATABASE_URL, PROD_DATABASE_URL
 * or CATALOG_SOURCE_URL.
 */
import pg from 'pg'
import type { User } from '../src/mock/types.ts'

const target = (process.env.PREPROD_DATABASE_URL || '').trim()
const source = (process.env.CATALOG_SOURCE_URL || '').trim()
if (!target) {
  console.error('Set PREPROD_DATABASE_URL to the preprod Supabase pooler URL.')
  process.exit(1)
}
for (const name of ['DATABASE_URL', 'PROD_DATABASE_URL', 'CATALOG_SOURCE_URL']) {
  if ((process.env[name] || '').trim() === target) {
    console.error(`PREPROD_DATABASE_URL equals ${name}. Refusing to wipe it.`)
    process.exit(1)
  }
}

const arg = process.argv.indexOf('--users')
const count = Math.max(0, Math.min(500, Number(arg > 0 ? process.argv[arg + 1] : 20) || 0))

/** Child tables last when inserting; truncate handles order with cascade. */
const CATALOG_TABLES = [
  'catalog_categories',
  'catalog_subcategories',
  'catalog_properties',
  'catalog_property_options',
  'catalog_property_categories',
  'catalog_property_subcategories',
]

const ssl = (url: string) => (/127\.0\.0\.1|localhost/.test(url) ? undefined : { rejectUnauthorized: false })
const db = new pg.Client({ connectionString: target, ssl: ssl(target) })
await db.connect()

// 1. Wipe every table in the public schema (migrations history lives elsewhere).
const tables = (
  await db.query(`select tablename from pg_tables where schemaname = 'public'`)
).rows.map((row) => `"${row.tablename}"`)
if (tables.length) await db.query(`truncate ${tables.join(', ')} restart identity cascade`)
console.log(`Wiped ${tables.length} tables.`)

// 2. Empty world: bootstrap admin, default system, example catalog (replaced below).
process.env.DATABASE_URL = target
delete process.env.PROD_DATABASE_URL
process.env.PLANTX_SEED = 'empty'
const { ensureDataFiles } = await import('../server/src/lib/ensureData.ts')
const { getStore } = await import('../server/src/db/index.ts')
await ensureDataFiles()

// 3. Catalog from production, read only.
if (source) {
  const prod = new pg.Client({ connectionString: source, ssl: ssl(source) })
  await prod.connect()
  await prod.query('begin read only')
  const copied: Record<string, number> = {}
  const data: Record<string, Record<string, unknown>[]> = {}
  for (const table of CATALOG_TABLES) data[table] = (await prod.query(`select * from ${table}`)).rows
  await prod.query('commit')
  await prod.end()

  await db.query('begin')
  await db.query(`truncate ${CATALOG_TABLES.join(', ')} cascade`)
  for (const table of CATALOG_TABLES) {
    const columns = new Set(
      (
        await db.query(`select column_name from information_schema.columns where table_schema = 'public' and table_name = $1`, [table])
      ).rows.map((row) => row.column_name as string),
    )
    for (const row of data[table]!) {
      const keys = Object.keys(row).filter((key) => columns.has(key))
      await db.query(
        `insert into ${table} (${keys.map((k) => `"${k}"`).join(', ')}) values (${keys.map((_, i) => `$${i + 1}`).join(', ')})`,
        keys.map((k) => (row[k] !== null && typeof row[k] === 'object' && !(row[k] instanceof Date) ? JSON.stringify(row[k]) : row[k])),
      )
    }
    copied[table] = data[table]!.length
  }
  await db.query('commit')
  console.log('Catalog copied from production:', copied)
} else {
  console.log('No CATALOG_SOURCE_URL: kept the example catalog.')
}
await db.end()

// 4. Empty testers: no plants, todos or friends.
const REGIONS = [
  { region: 'Tel Aviv', regionHe: 'תל אביב', lat: 32.0853, lng: 34.7818 },
  { region: 'Jerusalem', regionHe: 'ירושלים', lat: 31.7683, lng: 35.2137 },
  { region: 'Haifa', regionHe: 'חיפה', lat: 32.794, lng: 34.9896 },
  { region: 'Central Israel', regionHe: 'מרכז', lat: 31.968, lng: 34.806 },
  { region: 'Beer Sheva', regionHe: 'באר שבע', lat: 31.252, lng: 34.7915 },
]
const COLORS = ['#1FA85A', '#2B6CB0', '#B7791F', '#9F7AEA', '#C53030', '#319795']
const testerId = (n: number) => `test-user-${String(n).padStart(3, '0')}`

const store = getStore()
const users = await store.users.list()
for (let n = 1; n <= count; n++) {
  const id = testerId(n)
  const tester: User = {
    id,
    name: `Tester ${n}`,
    nameHe: `בודק ${n}`,
    email: `${id}@preprod.invalid`,
    role: 'grower',
    ...REGIONS[n % REGIONS.length]!,
    bio: '',
    bioHe: '',
    rating: 0,
    completedOrders: 0,
    verificationRate: 0,
    cancellations: 0,
    specialties: [],
    specialtiesHe: [],
    avatarColor: COLORS[n % COLORS.length]!,
    friendIds: [],
    accountStatus: 'active',
    preapproved: true,
  }
  users.push(tester)
}
await store.users.saveAll(users)

console.log(`Users: ${users.map((user) => user.id).join(', ')}`)
console.log('Admin: u-admin (Google as the bootstrap Gmail, or the test-login link).')
process.exit(0)
