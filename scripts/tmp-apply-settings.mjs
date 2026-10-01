import { readFileSync } from 'node:fs'
import pg from 'pg'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const i = line.indexOf('=')
      return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
    }),
)

const version = '20261001160000'
const sql = readFileSync(`supabase/migrations/${version}_identify_provider_settings.sql`, 'utf8')
const client = new pg.Client({ connectionString: env.PROD_DATABASE_URL, ssl: { rejectUnauthorized: false } })
await client.connect()
const exists = await client.query(`select to_regclass('public.identify_provider_settings') as t`)
if (exists.rows[0].t) {
  console.log('identify_provider_settings already exists')
} else {
  await client.query('begin')
  await client.query(sql)
  const tracked = await client.query(`select to_regclass('supabase_migrations.schema_migrations') as t`)
  if (tracked.rows[0].t) {
    await client.query(
      `insert into supabase_migrations.schema_migrations (version, name) values ($1, 'identify_provider_settings') on conflict do nothing`,
      [version],
    )
  }
  await client.query('commit')
  console.log('applied', version)
}
await client.end()
