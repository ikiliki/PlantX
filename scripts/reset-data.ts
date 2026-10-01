/**
 * Reset a JSON db folder.
 * Usage: tsx scripts/reset-data.ts [empty|demo]
 *   empty → clear server/data (QA JSON files). Next QA API start seeds the bootstrap admin.
 *   demo  → copy fixtures into server/data-local (kept for fixture dumps; the local UI does not read them).
 */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const fixturesDir = path.join(root, 'server', 'fixtures', 'demo')
const mode = (process.argv[2] || 'empty').toLowerCase()
const dataDir = path.join(root, 'server', mode === 'demo' ? 'data-local' : 'data')

function clearDataJson() {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
    return
  }
  for (const name of readdirSync(dataDir)) {
    if (name.endsWith('.json')) rmSync(path.join(dataDir, name), { force: true })
  }
}

clearDataJson()

if (mode === 'demo') {
  if (!existsSync(fixturesDir)) {
    console.error('Missing server/fixtures/demo. Run: npm run seed:fixtures')
    process.exit(1)
  }
  mkdirSync(dataDir, { recursive: true })
  for (const name of readdirSync(fixturesDir)) {
    if (!name.endsWith('.json')) continue
    cpSync(path.join(fixturesDir, name), path.join(dataDir, name))
  }
  console.log('server/data-local ← fixtures/demo (mock development)')
} else {
  // Next local API start writes empty live via ensureDataFiles().
  console.log('server/data cleared. Next local API start seeds empty live (+ bootstrap admin).')
}
