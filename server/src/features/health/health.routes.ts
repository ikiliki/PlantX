import { Hono } from 'hono'
import { logger } from '../../lib/logger.ts'
import { recordFailure } from '../../lib/observability.ts'
import { rateLimit } from '../../lib/rateLimit.ts'
import type { RequestIdEnv } from '../../lib/requestLog.ts'
import { healthService } from './health.service.ts'

export const healthRoutes = new Hono<RequestIdEnv>()

/** Public uptime check: `{ ok, version, env }`. No database. */
healthRoutes.get('/', (c) => c.json(healthService.ping()))

function text(value: unknown, max: number) {
  return typeof value === 'string' ? value.slice(0, max) : ''
}

/**
 * A browser crash or unhandled rejection (#56). Anyone may send one (guests crash too), a few a minute.
 * Logged and alerted; the page is kept without its query string.
 */
healthRoutes.post(
  '/client-error',
  rateLimit({ name: 'client-error', max: 20, windowSeconds: 60, by: 'ip' }),
  async (c) => {
    const body = (await c.req.json().catch(() => null)) as Record<string, unknown> | null
    const message = text(body?.message, 300).trim()
    if (!message) return c.json({ error: 'invalid' }, 400)
    const page = text(body?.page, 500).split('?')[0]
    logger.error('client error', {
      requestId: c.get('requestId'),
      message,
      page,
      source: text(body?.source, 300),
      stack: text(body?.stack, 2000),
      lastRequestId: text(body?.lastRequestId, 80),
      userAgent: text(c.req.header('user-agent'), 300),
    })
    await recordFailure('client', message, { path: page })
    return c.body(null, 204)
  },
)
