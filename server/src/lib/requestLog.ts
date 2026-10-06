import { randomUUID } from 'node:crypto'
import { createMiddleware } from 'hono/factory'
import { logger } from './logger.ts'

export type RequestIdEnv = { Variables: { requestId: string } }

const INCOMING_ID = /^[A-Za-z0-9._-]{8,80}$/

/**
 * Every request gets an id (#56): taken from a sane incoming `x-request-id` (a proxy's), else a new one.
 * It is echoed in the `x-request-id` response header, so a failed call's id reaches the issue report,
 * and one log line per request carries it with the method, route, status, time and user.
 */
export const requestLog = createMiddleware<RequestIdEnv>(async (c, next) => {
  const incoming = c.req.header('x-request-id')
  const requestId = incoming && INCOMING_ID.test(incoming) ? incoming : randomUUID()
  c.set('requestId', requestId)
  // Set before the handler runs, so error responses from onError carry it too.
  c.header('x-request-id', requestId)
  const started = performance.now()
  await next()
  try {
    if (!c.res.headers.has('x-request-id')) c.res.headers.set('x-request-id', requestId)
  } catch {
    /* immutable headers: the id is still in the log line */
  }
  if (c.req.method === 'OPTIONS') return
  const user = (c.get as (key: string) => unknown)('user') as { id?: string } | undefined
  logger.info('request', {
    requestId,
    method: c.req.method,
    route: c.req.routePath,
    path: c.req.path,
    status: c.res.status,
    ms: Math.round(performance.now() - started),
    userId: user?.id ?? null,
  })
})
