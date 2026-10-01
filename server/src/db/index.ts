import { createSupabaseStore } from './drivers/supabase.ts'
import type { PlantxStore } from './store.ts'

let singleton: PlantxStore | null = null

export function getStore(): PlantxStore {
  if (!singleton) singleton = createSupabaseStore()
  return singleton
}

export function explainDbError(err: unknown): Error {
  const message = err instanceof Error ? err.message : String(err)
  const url = process.env.DATABASE_URL || process.env.PROD_DATABASE_URL || ''
  const local = /127\.0\.0\.1|localhost/.test(url)
  if (/ECONNREFUSED|ENOTFOUND|ETIMEDOUT|password authentication|Connection terminated/i.test(message)) {
    return new Error(
      local
        ? 'QA database is not running. Start Docker, then run: npm run qa:up'
        : 'Hosted database is not reachable. Check DATABASE_URL or PROD_DATABASE_URL.',
    )
  }
  if (/does not exist|42P01/.test(message)) {
    return new Error(
      local
        ? 'QA database has no PlantX schema. Run: npm run qa:up'
        : 'Hosted database has no PlantX schema. Apply supabase/migrations.',
    )
  }
  return err instanceof Error ? err : new Error(message)
}
