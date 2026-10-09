import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { withExtraCa } from './lib/extraCa.ts'

/**
 * Local API against the PlantX-PP database, behaving like a PP preview (email + password, PP badge, mock identify).
 * Reads `.env.preprod` in the repo, else `../plantx-preprod/.env.preprod`. Never touches PROD_DATABASE_URL.
 * SUPABASE_URL defaults to the project in PREPROD_DATABASE_URL; SUPABASE_ANON_KEY must be in the file.
 */
await withExtraCa()

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const file = [path.join(root, '.env.preprod'), path.join(root, '../plantx-preprod/.env.preprod')].find(existsSync)
const values: Record<string, string> = {}
for (const line of file ? readFileSync(file, 'utf8').replace(/^﻿/, '').split(/\r?\n/) : []) {
  const trimmed = line.trim()
  const eq = trimmed.indexOf('=')
  if (!trimmed || trimmed.startsWith('#') || eq <= 0) continue
  values[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim().replace(/^(['"])(.*)\1$/, '$2')
}
const value = (key: string) => (values[key] || process.env[key] || '').trim()

const databaseUrl = value('PREPROD_DATABASE_URL')
if (!databaseUrl) {
  console.error('Set PREPROD_DATABASE_URL in .env.preprod (the PlantX-PP pooler URL).')
  process.exit(1)
}
const ref = /postgres\.([a-z0-9]+):/.exec(databaseUrl)?.[1]

delete process.env.PROD_DATABASE_URL
process.env.PLANTX_ENV = 'prod'
process.env.PLANTX_SEED = 'empty'
process.env.PLANTX_DB = 'supabase'
process.env.DATABASE_URL = databaseUrl
process.env.PLANTX_PREPROD = '1'
delete process.env.VERCEL_ENV
delete process.env.PLANTX_DATA
for (const key of ['SESSION_SECRET', 'GOOGLE_CLIENT_ID', 'SUPABASE_ANON_KEY']) {
  if (value(key)) process.env[key] = value(key)
}
process.env.SUPABASE_URL = value('SUPABASE_URL') || (ref ? `https://${ref}.supabase.co` : '')
if (!process.env.SUPABASE_ANON_KEY) {
  console.warn('No SUPABASE_ANON_KEY in .env.preprod: the login card shows no email + password form.')
}
process.env.PORT = process.env.PORT || '8790'
await import('../server/src/index.ts')
