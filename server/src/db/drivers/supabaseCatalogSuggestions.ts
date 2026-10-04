import type pg from 'pg'
import type { CatalogSuggestion, CatalogSuggestionDraft } from '../../../../src/mock/types.ts'
import { fallbackDraft } from '../../features/catalog/catalogDraft.ts'
import type { PlantxStore } from '../store.ts'

function draftOf(row: Record<string, unknown>): CatalogSuggestionDraft {
  const stored = row.draft
  const parsed = typeof stored === 'string' ? safeJson(stored) : stored
  if (parsed && typeof parsed === 'object' && 'category' in parsed) {
    const draft = parsed as CatalogSuggestionDraft
    if (draft.category?.name && draft.subcategory?.name) return draft
  }
  const names = row.common_names
  return fallbackDraft({
    name: String(row.name ?? ''),
    scientificName: String(row.scientific_name ?? ''),
    genus: String(row.genus ?? ''),
    commonNames: Array.isArray(names) ? names.map(String) : [],
    provider: String(row.provider ?? ''),
    photo: '',
    takenSigns: [],
  })
}

function safeJson(value: string) {
  try {
    return JSON.parse(value) as unknown
  } catch {
    return undefined
  }
}

function rowOf(row: Record<string, unknown>): CatalogSuggestion {
  const names = row.common_names
  return {
    id: String(row.id),
    createdAt: new Date(String(row.created_at)).toISOString(),
    name: String(row.name),
    scientificName: String(row.scientific_name ?? ''),
    genus: String(row.genus ?? ''),
    commonNames: Array.isArray(names) ? names.map(String) : [],
    provider: String(row.provider ?? ''),
    hits: Number(row.hits ?? 1),
    status: row.status === 'dismissed' || row.status === 'added' ? row.status : 'open',
    draft: draftOf(row),
  }
}

/** Open category ideas from identify. */
export function supabaseCatalogSuggestions(pool: pg.Pool): PlantxStore['catalogSuggestions'] {
  return {
    async list(status = 'open') {
      const result =
        status === 'all'
          ? await pool.query(`select * from catalog_suggestions order by created_at desc`)
          : await pool.query(
              `select * from catalog_suggestions where status = $1 order by created_at desc`,
              [status],
            )
      return (result.rows as Record<string, unknown>[]).map(rowOf)
    },

    async suggest(input) {
      const key = input.scientificName.trim().toLowerCase() || input.name.trim().toLowerCase()
      if (!key) return
      const existing = await pool.query(
        `select id from catalog_suggestions
         where status = 'open' and lower(case when scientific_name <> '' then scientific_name else name end) = $1
         limit 1`,
        [key],
      )
      const found = existing.rows[0] as { id: string } | undefined
      if (found) {
        await pool.query(`update catalog_suggestions set hits = hits + 1 where id = $1`, [found.id])
        return
      }
      const id = `sug-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
      await pool.query(
        `insert into catalog_suggestions (id, name, scientific_name, genus, common_names, provider, draft)
         values ($1, $2, $3, $4, $5::jsonb, $6, $7::jsonb)`,
        [
          id,
          input.name,
          input.scientificName,
          input.genus,
          JSON.stringify(input.commonNames),
          input.provider,
          JSON.stringify(input.draft),
        ],
      )
    },

    async dismiss(id) {
      await pool.query(
        `update catalog_suggestions set status = 'dismissed' where id = $1 and status = 'open'`,
        [id],
      )
    },

    async accept(id) {
      await pool.query(
        `update catalog_suggestions set status = 'added' where id = $1 and status = 'open'`,
        [id],
      )
    },
  }
}
