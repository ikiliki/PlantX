import type { AnalyticsEventName, AnalyticsProps } from '../../../../src/mock/types.ts'
import { CLIENT_EVENTS, FUNNEL_DAYS } from '../../../../src/lib/analytics.ts'
import { getStore } from '../../db/index.ts'
import { logger } from '../../lib/logger.ts'

/** A return visit counts once a day: a sign-in or session start at least this long after the last one. */
const RETURN_GAP_MS = 20 * 60 * 60 * 1000

/** Small, flat and free of user text: short strings, numbers and flags only. */
function cleanProps(props: unknown): AnalyticsProps {
  if (!props || typeof props !== 'object') return {}
  const out: AnalyticsProps = {}
  for (const [key, value] of Object.entries(props as Record<string, unknown>).slice(0, 6)) {
    if (!/^[a-z_]{1,24}$/.test(key)) continue
    if (typeof value === 'number' && Number.isFinite(value)) out[key] = value
    else if (typeof value === 'boolean') out[key] = value
    else if (typeof value === 'string' && /^[a-z0-9_-]{1,24}$/.test(value)) out[key] = value
  }
  return out
}

/**
 * Funnel analytics (#59). Services record what they already know (sign-up, plant saved, care done);
 * the browser may send only `CLIENT_EVENTS`. Recording never fails the request that triggered it.
 */
export const analyticsService = {
  async track(name: AnalyticsEventName, userId: string | null, props: AnalyticsProps = {}) {
    try {
      await getStore().analytics.add({ name, userId, props: cleanProps(props) })
    } catch (error) {
      logger.warn('analytics event not recorded', { event: name }, error)
    }
  },

  /** Records the event with `first: true` when this user never had it before. */
  async trackFirst(name: AnalyticsEventName, userId: string, props: AnalyticsProps = {}) {
    const first = await getStore()
      .analytics.has(name, userId)
      .then((had) => !had)
      .catch(() => false)
    await analyticsService.track(name, userId, { ...props, first })
  },

  /** A signed-in visit. Counts as a return when the last one was a day ago or more. */
  async visit(userId: string) {
    try {
      const last = await getStore().analytics.lastAt('session_return', userId)
      const gap = last ? Date.now() - Date.parse(last) : Infinity
      if (gap < RETURN_GAP_MS) return
      await analyticsService.track('session_return', userId, {
        days: last ? Math.floor(gap / (24 * 60 * 60 * 1000)) : 0,
        first: !last,
      })
    } catch (error) {
      logger.warn('visit not recorded', {}, error)
    }
  },

  /** From the browser: only the allow-listed names. */
  async fromClient(name: unknown, props: unknown, userId: string | null) {
    if (typeof name !== 'string' || !(CLIENT_EVENTS as readonly string[]).includes(name)) return false
    await analyticsService.track(name as AnalyticsEventName, userId, cleanProps(props))
    return true
  },

  async funnel() {
    const since = new Date(Date.now() - FUNNEL_DAYS * 24 * 60 * 60 * 1000).toISOString()
    return { days: await getStore().analytics.funnel(since) }
  },
}
