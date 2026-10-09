import type pg from 'pg'
import type { ActivityComment } from '../../../../src/mock/types.ts'
import type { PlantxStore } from '../store.ts'

function commentOf(row: Record<string, unknown>): ActivityComment {
  return {
    id: String(row.id),
    activityId: String(row.activity_id),
    userId: String(row.user_id),
    body: String(row.body),
    createdAt: String(row.created_at),
  }
}

/** 🌿 reactions and comments on activities. `react` / `unreact` are idempotent. */
export function supabaseActivitySocial(pool: pg.Pool): PlantxStore['activitySocial'] {
  return {
    async counts(activityIds, viewerId) {
      const counts = new Map<string, { reactions: number; reacted: boolean; comments: number }>()
      if (activityIds.length === 0) return counts
      for (const id of activityIds) counts.set(id, { reactions: 0, reacted: false, comments: 0 })
      const [reactions, comments] = await Promise.all([
        pool.query(
          `select activity_id, count(*)::int as n, bool_or(user_id = $2) as mine
           from activity_reactions where activity_id = any($1) group by activity_id`,
          [activityIds, viewerId ?? ''],
        ),
        pool.query(
          `select activity_id, count(*)::int as n
           from activity_comments where activity_id = any($1) and deleted_at is null group by activity_id`,
          [activityIds],
        ),
      ])
      for (const row of reactions.rows as { activity_id: string; n: number; mine: boolean }[]) {
        const entry = counts.get(row.activity_id)
        if (entry) {
          entry.reactions = row.n
          entry.reacted = Boolean(row.mine)
        }
      }
      for (const row of comments.rows as { activity_id: string; n: number }[]) {
        const entry = counts.get(row.activity_id)
        if (entry) entry.comments = row.n
      }
      return counts
    },

    async react(activityId, userId) {
      await pool.query(
        `insert into activity_reactions (activity_id, user_id, created_at) values ($1, $2, $3)
         on conflict do nothing`,
        [activityId, userId, new Date().toISOString()],
      )
    },

    async unreact(activityId, userId) {
      await pool.query('delete from activity_reactions where activity_id = $1 and user_id = $2', [activityId, userId])
    },

    async comments(activityId) {
      const result = await pool.query(
        `select * from activity_comments where activity_id = $1 and deleted_at is null order by created_at, id`,
        [activityId],
      )
      return (result.rows as Record<string, unknown>[]).map(commentOf)
    },

    async addComment({ activityId, userId, body }) {
      const id = `comment-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
      const result = await pool.query(
        `insert into activity_comments (id, activity_id, user_id, body, created_at)
         values ($1, $2, $3, $4, $5) returning *`,
        [id, activityId, userId, body, new Date().toISOString()],
      )
      return commentOf(result.rows[0] as Record<string, unknown>)
    },

    async getComment(id) {
      const result = await pool.query('select * from activity_comments where id = $1 and deleted_at is null', [id])
      const row = result.rows[0] as Record<string, unknown> | undefined
      return row ? commentOf(row) : null
    },

    async softDeleteComment(id) {
      await pool.query('update activity_comments set deleted_at = $2 where id = $1 and deleted_at is null', [
        id,
        new Date().toISOString(),
      ])
    },
  }
}
