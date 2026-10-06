/** A grower report of a failed request or a page crash. The note is theirs. The context is captured behind the popup. */

export const ISSUE_NOTE_WORDS = 50

export type IssueKind = 'http' | 'client'

export type IssueStatus = 'open' | 'resolved' | 'dismissed'

export type IssueContext = {
  kind: IssueKind
  status: number
  method: string
  path: string
  page: string
  referrer: string
  message: string
  stack: string
  response: string
  userAgent: string
  language: string
  viewport: string
  screen: string
  timezone: string
  network: string
  online: boolean
  at: string
  /** The API's `x-request-id` for the failed call, or the last call before a crash; finds its log line (#56). */
  requestId: string
}

export type IssueReport = {
  id: string
  createdAt: string
  userId: string | null
  userName: string | null
  note: string
  status: IssueStatus
  context: IssueContext
}

export function wordCount(text: string) {
  return text.trim().match(/\S+/g)?.length ?? 0
}

/** Keeps the first 50 words, including the spaces the grower already typed. */
export function clampWords(text: string, max = ISSUE_NOTE_WORDS) {
  const re = /\S+/g
  let count = 0
  let end = text.length
  let match: RegExpExecArray | null
  while ((match = re.exec(text))) {
    count += 1
    if (count === max) {
      end = match.index + match[0].length
      break
    }
  }
  return count < max ? text : text.slice(0, end)
}

function text(value: unknown, max: number) {
  return typeof value === 'string' ? value.slice(0, max) : ''
}

/** Drops anything the client was not asked to send, and caps each field. */
export function sanitizeContext(input: unknown): IssueContext | null {
  if (!input || typeof input !== 'object') return null
  const row = input as Record<string, unknown>
  const kind = row.kind === 'client' ? 'client' : row.kind === 'http' ? 'http' : null
  if (!kind) return null
  const status = typeof row.status === 'number' && Number.isFinite(row.status) ? Math.trunc(row.status) : 0
  return {
    kind,
    status,
    method: text(row.method, 12).toUpperCase(),
    path: text(row.path, 500),
    page: text(row.page, 2000),
    referrer: text(row.referrer, 2000),
    message: text(row.message, 2000),
    stack: text(row.stack, 12000),
    response: text(row.response, 4000),
    userAgent: text(row.userAgent, 500),
    language: text(row.language, 40),
    viewport: text(row.viewport, 80),
    screen: text(row.screen, 80),
    timezone: text(row.timezone, 80),
    network: text(row.network, 40),
    online: row.online === true,
    at: text(row.at, 40),
    requestId: text(row.requestId, 80),
  }
}
