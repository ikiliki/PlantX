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
    origin: row.origin === 'member' ? 'member' : 'identify',
    suggestedBy: Array.isArray(row.suggested_by) ? row.suggested_by.map(String) : [],
    note: String(row.note ?? ''),
    draft: draftOf(row),
  }
}

/** A new variety joins rows for the same category and name; a new plant joins by scientific name, else name. */
function matchKey(input: { name: string; scientificName: string; draft: { categoryId?: string } }) {
  const categoryId = input.draft.categoryId?.trim() ?? ''
  const name = input.name.trim().toLowerCase()
  return { categoryId, key: categoryId ? name : input.scientificName.trim().toLowerCase() || name }
}

/** Plants the catalog lacks, from identify and from members. */
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

    async listFor(userId) {
      const result = await pool.query(
        `select * from catalog_suggestions where status = 'open' and $1 = any(suggested_by) order by created_at desc`,
        [userId],
      )
      return (result.rows as Record<string, unknown>[]).map(rowOf)
    },

    async suggest(input) {
      const { categoryId, key } = matchKey(input)
      if (!key) return null
      const userId = input.userId ?? ''
      const note = input.note?.trim() ?? ''
      const joined = await pool.query(
        `update catalog_suggestions
         set hits = hits + 1,
             suggested_by = case when $3 = '' or $3 = any(suggested_by) then suggested_by else array_append(suggested_by, $3) end,
             note = case when note = '' then $4 else note end
         where id = (
           select id from catalog_suggestions
           where status = 'open'
             and coalesce(draft ->> 'categoryId', '') = $2
             and lower(case when $2 <> '' or scientific_name = '' then name else scientific_name end) = $1
           order by created_at
           limit 1
         )
         returning *`,
        [key, categoryId, userId, note],
      )
      if (joined.rows[0]) return rowOf(joined.rows[0] as Record<string, unknown>)
      const id = `sug-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
      const created = await pool.query(
        `insert into catalog_suggestions
           (id, name, scientific_name, genus, common_names, provider, draft, origin, suggested_by, note)
         values ($1, $2, $3, $4, $5::jsonb, $6, $7::jsonb, $8, $9::text[], $10)
         returning *`,
        [
          id,
          input.name,
          input.scientificName,
          input.genus,
          JSON.stringify(input.commonNames),
          input.provider,
          JSON.stringify(input.draft),
          input.origin,
          userId ? [userId] : [],
          note,
        ],
      )
      return rowOf(created.rows[0] as Record<string, unknown>)
    },

    async setDraft(id, draft) {
      await pool.query(`update catalog_suggestions set draft = $2::jsonb where id = $1 and status = 'open'`, [
        id,
        JSON.stringify(draft),
      ])
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
