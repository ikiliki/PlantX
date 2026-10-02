import type pg from 'pg'
import type { IssueReport, IssueStatus } from '../../../../src/lib/issueReport.ts'
import { sanitizeContext } from '../../../../src/lib/issueReport.ts'
import type { PlantxStore } from '../store.ts'

const ENSURE_TABLE = `
create table if not exists issue_reports (
  id text primary key,
  created_at timestamptz not null default now(),
  user_id text references users (id) on delete set null,
  note text not null default '',
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  context jsonb not null
)`

const ENSURE_INDEX = `
create index if not exists issue_reports_created_at_idx on issue_reports (created_at desc)`

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
  let ready: Promise<void> | undefined

  function ensure() {
    ready ??= pool.query(ENSURE_TABLE).then(() => pool.query(ENSURE_INDEX)).then(() => undefined)
    return ready
  }

  return {
    async list() {
      await ensure()
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
      await ensure()
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
      await ensure()
      await pool.query(`update issue_reports set status = $2 where id = $1 and status = 'open'`, [id, status])
    },
  }
}
