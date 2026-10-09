/**
 * Preprod only. Gives the PP admin and every tester an email + password login in PlantX-PP's Supabase Auth,
 * without touching any PlantX data. Run it once after this change, after a PP reset (seed:preprod runs it),
 * or to change the passwords.
 *
 *   PREPROD_DATABASE_URL=... PP_SUPABASE_URL=https://<ref>.supabase.co PP_SUPABASE_SECRET_KEY=... \
 *   PP_TESTER_PASSWORD=... PP_ADMIN_PASSWORD=... npm run logins:preprod
 *
 * Testers sign in as test-user-NNN@preprod.invalid with PP_TESTER_PASSWORD. The admin (u-admin) signs in with
 * its own email (admin@preprod.invalid when the row has none) and PP_ADMIN_PASSWORD.
 * Refuses when PREPROD_DATABASE_URL equals DATABASE_URL or PROD_DATABASE_URL.
 */
import pg from 'pg'
import { pathToFileURL } from 'node:url'

const ADMIN_FALLBACK_EMAIL = 'admin@preprod.invalid'

type AuthUser = { id: string; email?: string }

function need(name: string) {
  const value = (process.env[name] || '').trim()
  if (!value) {
    console.error(`Set ${name}.`)
    process.exit(1)
  }
  return value
}

/** The seed calls this after its own checks (it points DATABASE_URL at PP on purpose). */
export async function syncPreprodLogins() {
  const target = need('PREPROD_DATABASE_URL')
  const url = need('PP_SUPABASE_URL').replace(/\/+$/, '')
  const key = need('PP_SUPABASE_SECRET_KEY')
  const testerPassword = need('PP_TESTER_PASSWORD')
  const adminPassword = need('PP_ADMIN_PASSWORD')
  if (testerPassword.length < 8 || adminPassword.length < 8) {
    console.error('Passwords need at least 8 characters.')
    process.exit(1)
  }
  if (testerPassword === adminPassword) {
    console.error('Use a different admin password: testers and bots share PP_TESTER_PASSWORD.')
    process.exit(1)
  }

  const admin = async (path: string, method = 'GET', body?: unknown) => {
    const res = await fetch(`${url}/auth/v1/admin/${path}`, {
      method,
      headers: { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
    const answer = (await res.json().catch(() => ({}))) as Record<string, unknown>
    if (!res.ok) throw new Error(`Supabase Auth ${method} ${path}: ${res.status} ${JSON.stringify(answer).slice(0, 200)}`)
    return answer
  }

  const ssl = /127\.0\.0\.1|localhost/.test(target) ? undefined : { rejectUnauthorized: false }
  const db = new pg.Client({ connectionString: target, ssl })
  await db.connect()
  const rows = (
    await db.query<{ id: string; email: string | null }>(
      `select id, email from users where id = 'u-admin' or id like 'test-user-%' order by id`,
    )
  ).rows
  const adminRow = rows.find((row) => row.id === 'u-admin')
  if (adminRow && !adminRow.email) {
    await db.query(`update users set email = $1 where id = 'u-admin'`, [ADMIN_FALLBACK_EMAIL])
    adminRow.email = ADMIN_FALLBACK_EMAIL
  }
  await db.end()

  const existing = new Map<string, AuthUser>()
  for (let page = 1; ; page++) {
    const { users } = (await admin(`users?page=${page}&per_page=1000`)) as { users: AuthUser[] }
    for (const user of users) if (user.email) existing.set(user.email.toLowerCase(), user)
    if (users.length < 1000) break
  }

  const logins: string[] = []
  for (const row of rows) {
    if (!row.email) continue
    const email = row.email.toLowerCase()
    const password = row.id === 'u-admin' ? adminPassword : testerPassword
    const found = existing.get(email)
    if (found) await admin(`users/${found.id}`, 'PUT', { password, email_confirm: true })
    else await admin('users', 'POST', { email, password, email_confirm: true })
    logins.push(`${row.id}: ${email}`)
  }
  console.log(`Logins (${logins.length}):\n  ${logins.join('\n  ')}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const target = need('PREPROD_DATABASE_URL')
  for (const name of ['DATABASE_URL', 'PROD_DATABASE_URL']) {
    if ((process.env[name] || '').trim() === target) {
      console.error(`PREPROD_DATABASE_URL equals ${name}. Refusing.`)
      process.exit(1)
    }
  }
  await syncPreprodLogins()
  process.exit(0)
}
