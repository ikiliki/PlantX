import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createSeed } from '../src/mock/seed.ts'
import { DEFAULT_SYSTEM } from '../src/theme/release.ts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'server', 'fixtures', 'demo')

const DEMO_EMAILS: Record<string, string> = {
  'u-ari': 'ari@plantx.dev',
  'u-maya': 'maya@plantx.dev',
  'u-daniel': 'daniel@plantx.dev',
  'u-noa': 'noa@plantx.dev',
  'u-gal': 'gal@plantx.dev',
  'u-dana': 'dana@plantx.dev',
}

function write(name: string, value: unknown) {
  writeFileSync(path.join(outDir, name), `${JSON.stringify(value, null, 2)}\n`)
  console.log(`wrote server/fixtures/demo/${name}`)
}

mkdirSync(outDir, { recursive: true })

const seed = createSeed()
for (const user of seed.users) {
  if (!user.email && DEMO_EMAILS[user.id]) user.email = DEMO_EMAILS[user.id]
  ;(user as { accountStatus?: string }).accountStatus = 'active'
}

write('system.json', seed.system ?? DEFAULT_SYSTEM)
write('users.json', seed.users)
write('plants.json', seed.plants)
write('activities.json', seed.updates)
write('catalog-categories.json', seed.catalog.categories)
write('catalog-subcategories.json', seed.catalog.subcategories)
write('catalog-properties.json', seed.catalog.properties)
write('pending-users.json', seed.pendingUsers)
write('pending-transactions.json', seed.pendingTransactions)

console.log('Demo fixtures ready for local runs (PLANTX_SEED=demo).')
