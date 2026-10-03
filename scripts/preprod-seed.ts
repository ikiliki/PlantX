/**
 * Preprod only. Seeds the preprod database with demo data plus synthetic testers
 * test-user-001 … test-user-NNN (emails @preprod.invalid, never deliverable).
 *
 *   PREPROD_DATABASE_URL=... npm run seed:preprod -- --users 200
 *
 * Reads PREPROD_DATABASE_URL only, and refuses when it equals DATABASE_URL or PROD_DATABASE_URL.
 * Re-running replaces earlier testers and their plants (a reset between test runs).
 */
import type { Plant, User } from '../src/mock/types.ts'

const target = (process.env.PREPROD_DATABASE_URL || '').trim()
if (!target) {
  console.error('Set PREPROD_DATABASE_URL to the preprod Supabase pooler URL.')
  process.exit(1)
}
for (const name of ['DATABASE_URL', 'PROD_DATABASE_URL']) {
  if ((process.env[name] || '').trim() === target) {
    console.error(`PREPROD_DATABASE_URL equals ${name}. Refusing to seed.`)
    process.exit(1)
  }
}

const arg = process.argv.indexOf('--users')
const count = Math.max(1, Math.min(1000, Number(arg > 0 ? process.argv[arg + 1] : 200) || 200))

process.env.DATABASE_URL = target
delete process.env.PROD_DATABASE_URL
process.env.PLANTX_SEED = 'demo'

const { ensureDataFiles } = await import('../server/src/lib/ensureData.ts')
const { getStore } = await import('../server/src/db/index.ts')
const { todoService } = await import('../server/src/features/todo/todo.service.ts')

const REGIONS = [
  { region: 'Tel Aviv', regionHe: 'תל אביב', lat: 32.0853, lng: 34.7818 },
  { region: 'Jerusalem', regionHe: 'ירושלים', lat: 31.7683, lng: 35.2137 },
  { region: 'Haifa', regionHe: 'חיפה', lat: 32.794, lng: 34.9896 },
  { region: 'Central Israel', regionHe: 'מרכז', lat: 31.968, lng: 34.806 },
  { region: 'Beer Sheva', regionHe: 'באר שבע', lat: 31.252, lng: 34.7915 },
]
const COLORS = ['#1FA85A', '#2B6CB0', '#B7791F', '#9F7AEA', '#C53030', '#319795']

const testerId = (n: number) => `test-user-${String(n).padStart(3, '0')}`
const isTester = (id: string) => id.startsWith('test-user-')

await ensureDataFiles()
const store = getStore()

const users = (await store.users.list()).filter((user) => !isTester(user.id))
const plants = (await store.plants.list()).filter((plant) => !isTester(plant.ownerId))
const templates = plants.filter((plant) => !plant.id.startsWith('pl-cfg-'))

for (let n = 1; n <= count; n++) {
  const id = testerId(n)
  const place = REGIONS[n % REGIONS.length]!
  const user: User = {
    id,
    name: `Tester ${n}`,
    nameHe: `בודק ${n}`,
    email: `${id}@preprod.invalid`,
    role: 'grower',
    ...place,
    bio: 'Synthetic preprod tester.',
    bioHe: 'בודק סינתטי.',
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
  users.push(user)

  // 2–4 plants each; every third tester lists one for sale so buyers spread out.
  const owned = 2 + (n % 3)
  for (let k = 0; k < owned; k++) {
    const template = templates[(n + k) % templates.length]!
    const plant: Plant = {
      ...structuredClone(template),
      id: `pl-${id}-${k + 1}`,
      code: `PT-${String(n).padStart(3, '0')}${k + 1}`,
      ownerId: id,
      status: k === 0 && n % 3 === 0 ? 'listed' : 'owned',
      verifiedBy: id,
      locationZone: place.region,
      locationZoneHe: place.regionHe,
      lat: place.lat,
      lng: place.lng,
    }
    plants.push(plant)
  }
}

await store.users.saveAll(users)
await store.plants.saveAll(plants)
const todos = await todoService.backfillFromPlants()
console.log(`Seeded ${count} testers (${testerId(1)} … ${testerId(count)}) and ${plants.length} plants in total.`)
console.log('Todo backfill:', todos)
console.log('Admin persona: u-admin. Guest persona: no sign-in.')
process.exit(0)
