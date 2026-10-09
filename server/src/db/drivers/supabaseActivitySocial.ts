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

    async recent(limit) {
      const result = await pool.query(
        `select c.id, c.activity_id, c.user_id, c.body, c.created_at, coalesce(u.name, '') as author_name,
                a.body as post_body, a.user_id as post_user_id
         from activity_comments c
         join activities a on a.id = c.activity_id
         left join users u on u.id = c.user_id
         where c.deleted_at is null
         order by c.created_at desc
         limit $1`,
        [limit],
      )
      return (result.rows as Record<string, unknown>[]).map((row) => ({
        id: String(row.id),
        activityId: String(row.activity_id),
        userId: String(row.user_id),
        authorName: String(row.author_name),
        body: String(row.body),
        createdAt: String(row.created_at),
        postBody: String(row.post_body),
        postUserId: String(row.post_user_id),
      }))
    },

    async forOwner(ownerId, limit) {
      const result = await pool.query(
        `select * from (
           select 'reaction' as kind, r.activity_id, a.plant_id, r.user_id, coalesce(u.name, '') as user_name,
                  '' as body, r.created_at
           from activity_reactions r
           join activities a on a.id = r.activity_id
           left join users u on u.id = r.user_id
           where a.user_id = $1
           union all
           select 'comment' as kind, c.activity_id, a.plant_id, c.user_id, coalesce(u.name, '') as user_name,
                  c.body, c.created_at
           from activity_comments c
           join activities a on a.id = c.activity_id
           left join users u on u.id = c.user_id
           where a.user_id = $1 and c.deleted_at is null
         ) social
         order by created_at desc
         limit $2`,
        [ownerId, limit],
      )
      return (result.rows as Record<string, unknown>[]).map((row) => ({
        kind: row.kind === 'comment' ? ('comment' as const) : ('reaction' as const),
        activityId: String(row.activity_id),
        plantId: row.plant_id ? String(row.plant_id) : null,
        userId: String(row.user_id),
        userName: String(row.user_name),
        body: String(row.body ?? ''),
        createdAt: String(row.created_at),
      }))
    },

    async recentReactions(limit) {
      const result = await pool.query(
        `select r.activity_id, r.user_id, r.created_at, coalesce(u.name, '') as user_name,
                a.body as post_body, a.user_id as post_user_id
         from activity_reactions r
         join activities a on a.id = r.activity_id
         left join users u on u.id = r.user_id
         order by r.created_at desc
         limit $1`,
        [limit],
      )
      return (result.rows as Record<string, unknown>[]).map((row) => ({
        activityId: String(row.activity_id),
        userId: String(row.user_id),
        userName: String(row.user_name),
        createdAt: String(row.created_at),
        postBody: String(row.post_body),
        postUserId: String(row.post_user_id),
      }))
    },

    async softDeleteComment(id) {
      await pool.query('update activity_comments set deleted_at = $2 where id = $1 and deleted_at is null', [
        id,
        new Date().toISOString(),
      ])
    },
  }
}
