import type pg from 'pg'
import type { IssueReport, IssueStatus } from '../../../../src/lib/issueReport.ts'
import { sanitizeContext } from '../../../../src/lib/issueReport.ts'
import type { PlantxStore } from '../store.ts'

function rowOf(row: Record<string, unknown>): IssueReport | null {
  const context = sanitizeContext(row.context)
  if (!context) return null
  const status: IssueStatus =
    row.status === 'resolved' || row.status === 'dismissed' ? row.status : 'open'
  return {
    id: String(row.id),
    createdAt: new Date(String(row.created_at)).toISOString(),
    userId: row.user_id ? String(row.user_id) : null,
    userName: row.user_name ? String(row.user_name) : null,
    note: String(row.note ?? ''),
    status,
    context,
  }
}

export function supabaseIssueReports(pool: pg.Pool): PlantxStore['issueReports'] {
  return {
    async list() {
      const result = await pool.query(
        `select r.*, u.name as user_name
         from issue_reports r
         left join users u on u.id = r.user_id
         order by r.created_at desc
         limit 200`,
      )
      return (result.rows as Record<string, unknown>[]).map(rowOf).filter((row): row is IssueReport => row != null)
    },

    async add({ userId, note, context }) {
      const id = `issue-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
      const result = await pool.query(
        `insert into issue_reports (id, user_id, note, context)
         values ($1, $2, $3, $4::jsonb)
         returning id, created_at, user_id, note, status, context`,
        [id, userId, note, JSON.stringify(context)],
      )
      const saved = rowOf(result.rows[0] as Record<string, unknown>)
      if (!saved) throw new Error('Issue report was not saved')
      if (userId) {
        const named = await pool.query('select name from users where id = $1', [userId])
        const name = named.rows[0] as { name?: string } | undefined
        if (name?.name) saved.userName = String(name.name)
      }
      return saved
    },

    async setStatus(id, status) {
      await pool.query(`update issue_reports set status = $2 where id = $1 and status = 'open'`, [id, status])
    },
  }
}
