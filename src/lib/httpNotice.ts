import { sanitizeContext, type IssueContext, type IssueKind } from './issueReport'

export type NoticeTone = 'fail'

export type HttpNotice = {
  id: number
  tone: NoticeTone
  context: IssueContext
}

type Listener = (items: readonly HttpNotice[]) => void

const listeners = new Set<Listener>()
let items: HttpNotice[] = []
let seq = 0
let watching = false

function emit() {
  const snapshot = items.slice()
  listeners.forEach((listener) => listener(snapshot))
}

export function subscribeHttpNotices(listener: Listener) {
  listener(items.slice())
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function dismissHttpNotice(id: number) {
  items = items.filter((item) => item.id !== id)
  emit()
}

function networkType() {
  const nav = navigator as Navigator & { connection?: { effectiveType?: string } }
  return nav.connection?.effectiveType ?? ''
}

function browserFields() {
  return {
    page: window.location.href,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    language: navigator.language,
    viewport: `${window.innerWidth}x${window.innerHeight}@${window.devicePixelRatio}`,
    screen: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? '',
    network: networkType(),
    online: navigator.onLine,
    at: new Date().toISOString(),
  }
}

function noticeKey(context: IssueContext) {
  return `${context.kind}|${context.status}|${context.method}|${context.path}|${context.message.slice(0, 160)}`
}

function push(context: IssueContext) {
  const clean = sanitizeContext(context)
  if (!clean) return
  const key = noticeKey(clean)
  if (items.some((item) => noticeKey(item.context) === key)) return
  const notice: HttpNotice = { id: ++seq, tone: 'fail', context: clean }
  items = [notice, ...items].slice(0, 4)
  emit()
}

function reportError(input: {
  kind: IssueKind
  status: number
  method: string
  path: string
  message: string
  stack: string
  response: string
}) {
  push({ ...browserFields(), ...input })
}

function messageFromBody(raw: string) {
  try {
    const body = JSON.parse(raw) as { message?: unknown; error?: unknown }
    if (typeof body.message === 'string' && body.message) return body.message
    if (typeof body.error === 'string' && body.error) return body.error
  } catch {
    /* not json */
  }
  return raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300)
}

/** Popup for HTTP 500s, failed connections, and page crashes. Success stays quiet. */
export function plantFetch(path: string, init?: RequestInit) {
  const method = (init?.method ?? 'GET').toUpperCase()
  const clean = path.split('?')[0] || path
  return fetch(path, init).then(
    async (res) => {
      if (res.status >= 500) {
        const raw = await res.clone().text().catch(() => '')
        reportError({
          kind: 'http',
          status: res.status,
          method,
          path: clean,
          message: messageFromBody(raw),
          stack: new Error(`HTTP ${res.status} ${method} ${clean}`).stack ?? '',
          response: raw,
        })
      }
      return res
    },
    (err: unknown) => {
      const error = err instanceof Error ? err : new Error('Request failed')
      const timedOut = error.name === 'AbortError'
      reportError({
        kind: 'http',
        status: 0,
        method,
        path: clean,
        message: timedOut ? 'timeout' : error.message || 'offline',
        stack: error.stack ?? '',
        response: '',
      })
      throw err
    },
  )
}

function reportClient(message: string, stack: string, path: string) {
  if (/ResizeObserver loop/.test(message)) return
  if (message === 'Script error.' && !stack) return
  reportError({
    kind: 'client',
    status: 0,
    method: '',
    path,
    message,
    stack,
    response: '',
  })
}

/** Once per page. Crashes that never hit the API still get a report. */
export function watchClientErrors() {
  if (watching || typeof window === 'undefined') return
  watching = true
  window.addEventListener('error', (event) => {
    const error = event.error
    const stack = error instanceof Error ? (error.stack ?? '') : ''
    const where = event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : window.location.pathname
    reportClient(event.message || 'Script error', stack, where)
  })
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
    const error = reason instanceof Error ? reason : new Error(typeof reason === 'string' ? reason : 'Unhandled rejection')
    reportClient(error.message || 'Unhandled rejection', error.stack ?? '', window.location.pathname)
  })
}

/** Raw fetch so a failed report does not open another error popup. */
export async function sendIssueReport(note: string, context: IssueContext) {
  try {
    const res = await fetch('/api/issues', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: note.trim(), context }),
    })
    return res.ok
  } catch {
    return false
  }
}
