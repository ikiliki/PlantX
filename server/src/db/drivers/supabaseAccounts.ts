import type pg from 'pg'
import type { PlantxStore } from '../store.ts'

/**
 * A member deleting their own account. The users row goes, and the foreign keys take the rest:
 * plants (photos, traits, history, identifications), activities, tasks, scans and analytics cascade;
 * issue reports and the moderation actor are set to null. Their sign-up applications go too, so the
 * email is free to sign up again, and they leave the suggester lists of catalog suggestions.
 */
export function supabaseAccounts(pool: pg.Pool): PlantxStore['accounts'] {
  return {
    async erase(userId) {
      const client = await pool.connect()
      try {
        await client.query('begin')
        const found = await client.query<{ email: string | null }>('select email from users where id = $1', [userId])
        const email = found.rows[0]?.email
        if (email) await client.query('delete from pending_users where lower(email) = lower($1)', [email])
        await client.query('delete from pending_users where user_id = $1', [userId])
        await client.query(
          'update catalog_suggestions set suggested_by = array_remove(suggested_by, $1) where $1 = any(suggested_by)',
          [userId],
        )
        await client.query('delete from users where id = $1', [userId])
        await client.query('commit')
      } catch (error) {
        await client.query('rollback')
        throw error
      } finally {
        client.release()
      }
    },
  }
}
