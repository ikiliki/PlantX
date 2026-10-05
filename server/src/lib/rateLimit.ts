import type { Context, MiddlewareHandler } from 'hono'
import { getStore } from '../db/index.ts'
import { Errors } from './errors.ts'
import { logger } from './logger.ts'
import { userFromSession } from './session.ts'

/**
 * Abuse limits (#57): a fixed window per caller, counted in Postgres (rate_limits) because Vercel
 * functions share no memory. This is not the product scan quota (#67), which counts a member's day.
 * A broken counter never blocks the API: the request goes through and the failure is logged.
 */
export function clientIp(c: Context) {
  const forwarded = c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || c.req.header('x-real-ip') || 'local'
}

let lastPrune = 0

export function rateLimit(options: {
  /** Key prefix, e.g. 'identify'. */
  name: string
  /** Requests allowed per window. */
  max: number
  windowSeconds: number
  /** Count the signed-in user when there is one, else the IP. */
  by?: 'user-or-ip' | 'ip'
}): MiddlewareHandler {
  const windowMs = options.windowSeconds * 1000
  return async (c, next) => {
    let key = `${options.name}:ip:${clientIp(c)}`
    if (options.by !== 'ip') {
      const user = await userFromSession(c).catch(() => null)
      if (user) key = `${options.name}:user:${user.id}`
    }
    const start = Math.floor(Date.now() / windowMs) * windowMs
    let count = 0
    try {
      const store = getStore()
      count = await store.rateLimits.hit(key, new Date(start).toISOString())
      if (Date.now() - lastPrune > 10 * 60_000) {
        lastPrune = Date.now()
        void store.rateLimits.prune(new Date(Date.now() - 24 * 60 * 60_000).toISOString()).catch(() => undefined)
      }
    } catch (err) {
      logger.warn('rate limit unavailable; letting the request through', { key }, err)
    }
    if (count > options.max) {
      throw Errors.rateLimited(Math.max(1, Math.ceil((start + windowMs - Date.now()) / 1000)))
    }
    await next()
  }
}
