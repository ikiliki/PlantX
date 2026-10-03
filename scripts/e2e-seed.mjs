// CI only: a fresh QA database has one category and no traits. Load the demo catalog
// (Pothos with a required Growth form) so the Add Plant tests have something to leave out.
// Usage: node scripts/e2e-seed.mjs [apiBase]   (default http://localhost:8787)
import { readFileSync } from 'node:fs'

const api = process.argv[2] || 'http://localhost:8787'
const session = await fetch(`${api}/api/session`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ userId: 'u-admin' }),
})
if (!session.ok) throw new Error(`sign in: HTTP ${session.status}`)
const cookie = session.headers.getSetCookie().map((item) => item.split(';')[0]).join('; ')

const catalog = JSON.parse(readFileSync('server/fixtures/demo/catalog.json', 'utf8'))
const saved = await fetch(`${api}/api/catalog`, {
  method: 'PUT',
  headers: { 'content-type': 'application/json', cookie },
  body: JSON.stringify({ catalog }),
})
if (!saved.ok) throw new Error(`save catalog: HTTP ${saved.status} ${await saved.text()}`)
console.log(`Catalog loaded: ${catalog.categories.length} categories, ${catalog.properties.length} properties`)
