/**
 * Preprod only. N seeded testers use the API at the same time, then an integrity check counts
 * plants that were created and later disappeared (the whole-table saveAll race).
 *
 *   PLANTX_PP_PASSWORD=... [VERCEL_BYPASS=...] npm run load:preprod -- --base https://<preview> --users 20
 *
 * Testers sign in with email + password (scripts/preprod-logins.ts). Sign-in is rate limited per IP
 * (30 per 10 minutes here, and Supabase Auth's own limit), so one machine loads at most ~25 testers.
 *
 * Identify runs in mock mode on preprod (the server forces it), so no provider is called.
 */
import { readFileSync } from 'node:fs'

const LEGAL_VERSION = readFileSync(new URL('../src/features/legal/legalVersion.ts', import.meta.url), 'utf8').match(
  /LEGAL_VERSION\s*=\s*'([^']+)'/,
)?.[1]

const args = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : fallback
}
const base = String(opt('base', 'http://127.0.0.1:8787')).replace(/\/$/, '')
const users = Number(opt('users', 20))
const password = (process.env.PLANTX_PP_PASSWORD || '').trim()
const bypass = (process.env.VERCEL_BYPASS || '').trim()
if (!password) {
  console.error("Set PLANTX_PP_PASSWORD (the testers' password).")
  process.exit(1)
}

const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const testerId = (n) => `test-user-${String(n).padStart(3, '0')}`
const TEMPLATE = JSON.parse(
  readFileSync(new URL('../server/fixtures/demo/plants.json', import.meta.url), 'utf8'),
)[0]

const timings = new Map()
const failures = new Map()
const created = []

async function call(label, path, { cookie, method = 'GET', body, headers = {} } = {}) {
  const started = performance.now()
  let res
  try {
    res = await fetch(`${base}${path}`, {
      method,
      redirect: 'manual',
      headers: {
        ...(body ? { 'content-type': 'application/json' } : {}),
        ...(cookie ? { cookie } : {}),
        ...(bypass ? { 'x-vercel-protection-bypass': bypass } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    failures.set(label, (failures.get(label) ?? 0) + 1)
    throw err
  }
  const ms = performance.now() - started
  if (!timings.has(label)) timings.set(label, [])
  timings.get(label).push(ms)
  if (!res.ok) {
    failures.set(label, (failures.get(label) ?? 0) + 1)
    throw new Error(`${label} ${res.status}: ${(await res.text()).slice(0, 200)}`)
  }
  return res
}

function signIn(id) {
  return call('sign in', '/api/session/password', {
    method: 'POST',
    body: { email: `${id}@preprod.invalid`, password, termsVersion: LEGAL_VERSION },
  })
}

async function tester(n) {
  const id = testerId(n)
  const login = await signIn(id)
  const session = login.headers.getSetCookie().find((line) => line.startsWith('plantx_session='))
  if (!session) throw new Error(`no session cookie for ${id}`)
  const cookie = session.split(';')[0]

  await call('live', '/api/live', { cookie })
  const { plants } = await (await call('plants', '/api/plants', { cookie })).json()
  await call('identify (mock)', '/api/identify', { cookie, method: 'POST', body: { image: PIXEL } })

  // Empty testers have nothing to copy, so fall back to a demo plant shape.
  const mine = plants.find((plant) => plant.ownerId === id) ?? TEMPLATE
  const plantId = `pl-load-${id}-${Date.now()}`
  await call('add plant', '/api/plants', {
    cookie,
    method: 'POST',
    body: { ...mine, id: plantId, ownerId: id, title: `${mine.title} (load)`, status: 'owned', parentId: undefined },
  })
  created.push(plantId)

  const { todos } = await (await call('todos', '/api/todos?open=1', { cookie })).json()
  if (todos[0]) {
    const completedOn = new Date().toISOString().slice(0, 10)
    await call('complete todo', `/api/todos/${todos[0].id}/complete`, { cookie, method: 'POST', body: { completedOn } })
  }
  await call('levels', '/api/users/levels', { cookie })
}

function pct(list, p) {
  const sorted = [...list].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))] ?? 0
}

console.log(`Load: ${users} testers against ${base}`)
const started = performance.now()
const results = await Promise.allSettled(Array.from({ length: users }, (_, i) => tester(i + 1)))
const seconds = ((performance.now() - started) / 1000).toFixed(1)

const rejected = results.filter((r) => r.status === 'rejected')
console.log(`\nDone in ${seconds}s. Testers finished: ${users - rejected.length}/${users}`)
for (const r of rejected.slice(0, 5)) console.log('  ✗', r.reason?.message ?? r.reason)

console.log('\nEndpoint            calls   p50ms   p95ms  errors')
for (const [label, list] of timings) {
  console.log(
    `${label.padEnd(18)} ${String(list.length).padStart(6)} ${pct(list, 50).toFixed(0).padStart(7)} ${pct(list, 95).toFixed(0).padStart(7)} ${String(failures.get(label) ?? 0).padStart(7)}`,
  )
}

// Integrity: every plant a tester added should still exist.
const check = await signIn(testerId(1))
const cookie = check.headers.getSetCookie().find((line) => line.startsWith('plantx_session='))?.split(';')[0]
const { plants: after } = await (await call('plants', '/api/plants', { cookie })).json()
const present = new Set(after.map((plant) => plant.id))
const lost = created.filter((id) => !present.has(id))
console.log(`\nIntegrity: added ${created.length} plants, ${lost.length} missing afterwards (lost updates).`)
if (lost.length) console.log('  e.g.', lost.slice(0, 5).join(', '))
process.exit(rejected.length || lost.length ? 1 : 0)
