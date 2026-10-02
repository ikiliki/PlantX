import type { IssueContext, IssueReport } from './issueReport'

const KEY = 'plantx-issue-inbox'

type Listener = (rows: readonly IssueReport[]) => void

function read(): IssueReport[] {
  if (typeof sessionStorage === 'undefined') return []
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as IssueReport[]) : []
  } catch {
    return []
  }
}

let rows = read()
const listeners = new Set<Listener>()

function emit() {
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(rows))
    } catch {
      /* a full quota still keeps the in-memory copy */
    }
  }
  const snapshot = rows.slice()
  listeners.forEach((listener) => listener(snapshot))
}

export function subscribeIssues(listener: Listener) {
  listener(rows.slice())
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Mock mode has no API. The admin server table reads this same inbox. */
export function fileLocalIssue(input: {
  note: string
  context: IssueContext
  userId: string | null
  userName: string | null
}) {
  const report: IssueReport = {
    id: `issue-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    userId: input.userId,
    userName: input.userName,
    note: input.note.trim(),
    status: 'open',
    context: input.context,
  }
  rows = [report, ...rows].slice(0, 200)
  emit()
  return report
}

export function setLocalIssueStatus(id: string, status: 'resolved' | 'dismissed') {
  rows = rows.map((row) => (row.id === id && row.status === 'open' ? { ...row, status } : row))
  emit()
}
