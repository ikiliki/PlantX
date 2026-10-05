import type pg from 'pg'
import type { ModerationEntry, ScanAdjustment, Visibility } from '../../../../src/mock/types.ts'
import type { PlantxStore } from '../store.ts'

const TABLE = { user: 'users', plant: 'plants', activity: 'activities' } as const

function adjustmentFrom(row: Record<string, unknown>): ScanAdjustment {
  const item: ScanAdjustment = {
    id: String(row.id),
    userId: String(row.user_id),
    day: String(row.day instanceof Date ? row.day.toISOString().slice(0, 10) : row.day).slice(0, 10),
    kind: row.kind as ScanAdjustment['kind'],
    delta: Number(row.delta ?? 0),
    value: row.value == null ? null : Number(row.value),
    reason: String(row.reason ?? ''),
    createdAt: new Date(String(row.created_at)).toISOString(),
  }
  if (row.created_by) item.createdBy = String(row.created_by)
  if (row.created_by_name) item.createdByName = String(row.created_by_name)
  return item
}

function entryFrom(row: Record<string, unknown>): ModerationEntry {
  const entry: ModerationEntry = {
    id: String(row.id),
    targetType: row.target_type as ModerationEntry['targetType'],
    targetId: String(row.target_id),
    action: row.action as ModerationEntry['action'],
    reason: String(row.reason ?? ''),
    cascade: (row.cascade as ModerationEntry['cascade'] | null) ?? {},
    createdAt: new Date(String(row.created_at)).toISOString(),
  }
  if (row.actor_id) entry.actorId = String(row.actor_id)
  if (row.actor_name) entry.actorName = String(row.actor_name)
  return entry
}

/** AI scan quota: today's Add Plant requests, admin extras and per-user limits. */
export function supabaseScanQuota(pool: pg.Pool): PlantxStore['scanQuota'] {
  return {
    async countAddPlant(userId, sinceIso) {
      const result = await pool.query(
        `select count(*)::int as n from identify_requests
         where user_id = $1 and source = 'addPlant' and created_at >= $2`,
        [userId, sinceIso],
      )
      return Number((result.rows[0] as { n?: number } | undefined)?.n ?? 0)
    },

    async adjustments(userId, day) {
      const result = await pool.query(
        `select a.*, u.name as created_by_name from scan_adjustments a
         left join users u on u.id = a.created_by
         where a.user_id = $1 and ($2::date is null or a.day = $2::date)
         order by a.created_at desc limit 50`,
        [userId, day ?? null],
      )
      return (result.rows as Record<string, unknown>[]).map(adjustmentFrom)
    },

    async extrasByUser(day) {
      const result = await pool.query(
        `select user_id, coalesce(sum(delta), 0)::int as extra from scan_adjustments
         where day = $1::date and kind = 'extra' group by user_id`,
        [day],
      )
      return Object.fromEntries((result.rows as { user_id: string; extra: number }[]).map((r) => [r.user_id, Number(r.extra)]))
    },

    async usedByUser(sinceIso) {
      const result = await pool.query(
        `select user_id, count(*)::int as n from identify_requests
         where source = 'addPlant' and created_at >= $1 group by user_id`,
        [sinceIso],
      )
      return Object.fromEntries((result.rows as { user_id: string; n: number }[]).map((r) => [r.user_id, Number(r.n)]))
    },

    async add(item) {
      await pool.query(
        `insert into scan_adjustments (id, user_id, day, kind, delta, value, reason, created_by, created_at)
         values ($1, $2, $3::date, $4, $5, $6, $7, $8, $9)`,
        [item.id, item.userId, item.day, item.kind, item.delta, item.value, item.reason, item.createdBy ?? null, item.createdAt],
      )
    },

    async setLimit(userId, limit) {
      await pool.query('update users set daily_scan_limit = $2 where id = $1', [userId, limit])
    },
  }
}

/** Fixed-window counters for abuse limits. */
export function supabaseRateLimits(pool: pg.Pool): PlantxStore['rateLimits'] {
  return {
    async hit(key, windowStart) {
      const result = await pool.query(
        `insert into rate_limits (key, window_start, count) values ($1, $2, 1)
         on conflict (key, window_start) do update set count = rate_limits.count + 1
         returning count`,
        [key, windowStart],
      )
      return Number((result.rows[0] as { count?: number } | undefined)?.count ?? 1)
    },

    async prune(beforeIso) {
      await pool.query('delete from rate_limits where window_start < $1', [beforeIso])
    },
  }
}

/** Hide / show / soft delete, and the audit log. Only these columns are written; saves never touch them. */
export function supabaseModeration(pool: pg.Pool): PlantxStore['moderation'] {
  return {
    async setVisibility(type, id, { visibility, by, reason }) {
      await pool.query(
        `update ${TABLE[type]}
         set visibility = $2, visibility_changed_by = $3, visibility_changed_at = now(), visibility_reason = $4
         where id = $1`,
        [id, visibility satisfies Visibility, by, reason],
      )
    },

    async log(entry) {
      await pool.query(
        `insert into moderation_log (id, actor_id, target_type, target_id, action, reason, cascade, created_at)
         values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)`,
        [
          entry.id,
          entry.actorId ?? null,
          entry.targetType,
          entry.targetId,
          entry.action,
          entry.reason,
          JSON.stringify(entry.cascade ?? {}),
          entry.createdAt,
        ],
      )
    },

    async list(limit) {
      const result = await pool.query(
        `select m.*, u.name as actor_name from moderation_log m
         left join users u on u.id = m.actor_id
         order by m.created_at desc limit $1`,
        [limit],
      )
      return (result.rows as Record<string, unknown>[]).map(entryFrom)
    },
  }
}

/** Visibility columns on a users / plants / activities row. */
export function visibilityFrom(row: Record<string, unknown>) {
  const meta: {
    visibility?: Visibility
    visibilityChangedBy?: string
    visibilityChangedAt?: string
    visibilityReason?: string
  } = {}
  const visibility = row.visibility as Visibility | undefined
  if (visibility && visibility !== 'visible') meta.visibility = visibility
  if (row.visibility_changed_by) meta.visibilityChangedBy = String(row.visibility_changed_by)
  if (row.visibility_changed_at) meta.visibilityChangedAt = new Date(String(row.visibility_changed_at)).toISOString()
  if (row.visibility_reason) meta.visibilityReason = String(row.visibility_reason)
  return meta
}
