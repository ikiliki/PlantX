import type pg from 'pg'
import type { IdentifyRequestRecord } from '../../../../src/mock/types.ts'
import { logger } from '../../lib/logger.ts'
import type { PlantxStore } from '../store.ts'

const UNDEFINED_TABLE = '42P01'
const UNDEFINED_COLUMN = '42703'

function isMissingTable(err: unknown) {
  return (err as { code?: string } | null)?.code === UNDEFINED_TABLE
}

function isMissingColumn(err: unknown) {
  return (err as { code?: string } | null)?.code === UNDEFINED_COLUMN
}

function recordFrom(row: Record<string, unknown>): IdentifyRequestRecord {
  const record: IdentifyRequestRecord = {
    id: String(row.id),
    createdAt: String(row.created_at),
    userId: String(row.user_id),
    source: row.source as IdentifyRequestRecord['source'],
    mode: row.mode as IdentifyRequestRecord['mode'],
    target: row.target as IdentifyRequestRecord['target'],
    status: row.status as IdentifyRequestRecord['status'],
    durationMs: Number(row.duration_ms ?? 0),
    tried: (row.tried as IdentifyRequestRecord['tried'] | null) ?? [],
  }
  if (row.user_name) record.userName = String(row.user_name)
  if (row.scenario) record.scenario = row.scenario as IdentifyRequestRecord['scenario']
  if (row.thumb) record.thumb = String(row.thumb)
  if (row.diagnosis) record.diagnosis = row.diagnosis as IdentifyRequestRecord['diagnosis']
  if (row.plant_id) record.plantId = String(row.plant_id)
  if (row.photo_index != null) record.photoIndex = Number(row.photo_index)
  if (row.fields) record.fields = row.fields as IdentifyRequestRecord['fields']
  return record
}

/** Prod may not have the migration yet, so a missing table reads empty and skips writes. */
export function supabaseIdentifyRequests(pool: pg.Pool): PlantxStore['identifyRequests'] {
  let warnedMissing = false
  let warnedLinks = false

  return {
    async list({ mode, limit }) {
      try {
        const result = await pool.query(
          `select r.*, u.name as user_name
           from identify_requests r
           left join users u on u.id = r.user_id
           where ($1::text is null or r.mode = $1)
           order by r.created_at desc
           limit $2`,
          [mode ?? null, limit],
        )
        return (result.rows as Record<string, unknown>[]).map(recordFrom)
      } catch (err) {
        if (isMissingTable(err)) return []
        throw err
      }
    },

    async get(id) {
      try {
        const result = await pool.query('select * from identify_requests where id = $1', [id])
        const row = result.rows[0] as Record<string, unknown> | undefined
        return row ? recordFrom(row) : null
      } catch (err) {
        if (isMissingTable(err)) return null
        throw err
      }
    },

    async add(record) {
      try {
        await pool.query(
          `insert into identify_requests (
            id, created_at, user_id, source, mode, target, scenario, status, thumb, duration_ms, diagnosis, tried
          ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12::jsonb)`,
          [
            record.id,
            record.createdAt,
            record.userId,
            record.source,
            record.mode,
            record.target,
            record.scenario ?? null,
            record.status,
            record.thumb ?? null,
            Math.round(record.durationMs),
            record.diagnosis ? JSON.stringify(record.diagnosis) : null,
            JSON.stringify(record.tried ?? []),
          ],
        )
      } catch (err) {
        if (!isMissingTable(err)) throw err
        if (!warnedMissing) {
          warnedMissing = true
          logger.warn('identify_requests table missing; history is not saved. Apply supabase/migrations.')
        }
      }
    },

    async link(id, { plantId, photoIndex, fields }) {
      try {
        await pool.query('update identify_requests set plant_id = $2, photo_index = $3, fields = $4::jsonb where id = $1', [
          id,
          plantId,
          photoIndex,
          fields ? JSON.stringify(fields) : null,
        ])
      } catch (err) {
        if (!isMissingTable(err) && !isMissingColumn(err)) throw err
        if (!warnedLinks) {
          warnedLinks = true
          logger.warn('identify_requests.plant_id missing; requests are not linked to plants. Apply supabase/migrations.')
        }
      }
    },
  }
}
