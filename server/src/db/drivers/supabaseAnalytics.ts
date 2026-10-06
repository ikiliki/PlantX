import type pg from 'pg'
import type { AnalyticsEventName, FunnelDay } from '../../../../src/mock/types.ts'
import type { PlantxStore } from '../store.ts'

/** Funnel events (#59). First-party rows only; props never hold names, emails or provider names. */
export function supabaseAnalytics(pool: pg.Pool): PlantxStore['analytics'] {
  return {
    async add(event) {
      await pool.query('insert into analytics_events (name, user_id, props) values ($1, $2, $3)', [
        event.name,
        event.userId ?? null,
        JSON.stringify(event.props ?? {}),
      ])
    },

    async has(name, userId) {
      const result = await pool.query('select 1 from analytics_events where name = $1 and user_id = $2 limit 1', [
        name,
        userId,
      ])
      return (result.rowCount ?? 0) > 0
    },

    async lastAt(name, userId) {
      const result = await pool.query<{ at: Date | null }>(
        'select max(created_at) as at from analytics_events where name = $1 and user_id = $2',
        [name, userId],
      )
      const at = result.rows[0]?.at
      return at ? new Date(at).toISOString() : null
    },

    async funnel(sinceIso) {
      const result = await pool.query<{ day: string; name: AnalyticsEventName; events: number; people: number }>(
        `select to_char(created_at at time zone 'Asia/Jerusalem', 'YYYY-MM-DD') as day, name,
                count(*)::int as events, count(distinct user_id)::int as people
         from analytics_events where created_at >= $1
         group by 1, 2 order by 1`,
        [sinceIso],
      )
      const days = new Map<string, FunnelDay>()
      for (const row of result.rows) {
        const day = days.get(row.day) ?? { day: row.day, counts: {}, people: {} }
        day.counts[row.name] = row.events
        day.people[row.name] = row.people
        days.set(row.day, day)
      }
      return [...days.values()]
    },
  }
}
