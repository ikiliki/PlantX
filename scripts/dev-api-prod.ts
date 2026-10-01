import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function readEnvFile() {
  const file = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env')
  const values: Record<string, string> = {}
  if (!existsSync(file)) return values
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    values[key] = value
  }
  return values
}

const file = readEnvFile()
const databaseUrl = (file.PROD_DATABASE_URL || process.env.PROD_DATABASE_URL || '').trim()
if (!databaseUrl) {
  console.error('Production uses the hosted Supabase database.')
  console.error('Set PROD_DATABASE_URL in .env to the Postgres URI (Project Settings → Database).')
  process.exit(1)
}

process.env.PLANTX_ENV = 'prod'
process.env.PLANTX_SEED = 'empty'
process.env.PLANTX_DB = 'supabase'
process.env.DATABASE_URL = databaseUrl
delete process.env.PLANTX_DATA
process.env.PORT = process.env.PORT || '8789'
await import('../server/src/index.ts')
