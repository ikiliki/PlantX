// CI only: a fresh QA database has one category and no traits. Load the demo catalog
// (Pothos with a required Growth form) so the Add Plant tests have something to leave out.
// It also adds one plain member, e2e-member: the admin is not scan-limited, so member-only screens need one,
// and one private plant of the admin's (with its activity) that the member must never see.
// Usage: node scripts/e2e-seed.mjs [apiBase]   (default http://localhost:8787)
import { readFileSync } from 'node:fs'
import pg from 'pg'

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

// The local QA database (same URL as scripts/dev-api-qa.ts). Never a hosted one.
const db = new pg.Client({ connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' })
await db.connect()
await db.query(
  `insert into users (id, position, name, name_he, role, avatar_color, email, nickname)
   values ('e2e-member', 1000, 'E2E Member', 'E2E Member', 'grower', '#5D7C4E', 'e2e-member@plantx.test', 'Grower 1000')
   on conflict (id) do nothing`,
)
await db.query(
  `insert into plants (id, position, code, owner_id, species_id, title, title_he, quantity, size_grade, rooting,
     location_zone, location_zone_he, lat, lng, status, created_at, is_private)
   values ('e2e-private-plant', 1000, 'POT-GOLD-M-EST', 'u-admin', 'sp-pothos', 'E2E private pothos',
     'E2E private pothos', 1, 'M', 'established', 'Unknown', 'לא ידוע', 31.4, 35.1, 'owned', '2026-10-06', true)
   on conflict (id) do nothing`,
)
await db.query(
  `insert into activities (id, position, kind, user_id, plant_id, body, body_he, created_at)
   values ('e2e-private-added', 1000, 'added', 'u-admin', 'e2e-private-plant', 'E2E private pothos added',
     'E2E private pothos added', '2026-10-06T08:00:00.000Z')
   on conflict (id) do nothing`,
)
await db.end()
console.log('Member added: e2e-member; private plant: e2e-private-plant')
