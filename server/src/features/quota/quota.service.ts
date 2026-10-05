import type { ScanAdjustment, ScanQuota, User } from '../../../../src/mock/types.ts'
import { getStore } from '../../db/index.ts'
import { Errors } from '../../lib/errors.ts'
import { logger } from '../../lib/logger.ts'

/**
 * AI scan quota (#67). Members get DEFAULT_DAILY_SCANS Add Plant scans a day, reset at 00:00 Israel time.
 * Used = this member's Add Plant identify requests since that midnight (identify_requests, no counter).
 * An admin can give extra scans for one day and set a member's daily limit; both are logged.
 * The admin is not limited. Guests cannot scan at all (identify requires a session).
 */
export const DEFAULT_DAILY_SCANS = 3
const ZONE = 'Asia/Jerusalem'

/** YYYY-MM-DD in Israel time. */
export function israelDay(at = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(at)
}

/** Minutes Israel is ahead of UTC at this instant (120 or 180). */
function israelOffsetMinutes(at: Date) {
  const name = new Intl.DateTimeFormat('en-US', { timeZone: ZONE, timeZoneName: 'longOffset' })
    .formatToParts(at)
    .find((part) => part.type === 'timeZoneName')?.value
  const match = name?.match(/GMT([+-])(\d{2}):(\d{2})/)
  if (!match) return 120
  const minutes = Number(match[2]) * 60 + Number(match[3])
  return match[1] === '-' ? -minutes : minutes
}

/** The UTC instant of 00:00 Israel time on `day`. */
export function israelMidnight(day: string) {
  const guess = new Date(`${day}T00:00:00Z`)
  return new Date(guess.getTime() - israelOffsetMinutes(guess) * 60_000)
}

function nextDay(day: string) {
  const date = new Date(`${day}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().slice(0, 10)
}

function quotaOf(user: User, used: number, extra: number, day: string): ScanQuota {
  const limit = user.dailyScanLimit ?? DEFAULT_DAILY_SCANS
  return {
    used,
    limit,
    extra,
    remaining: Math.max(0, limit + extra - used),
    resetsAt: israelMidnight(nextDay(day)).toISOString(),
  }
}

async function findUser(userId: string) {
  const user = (await getStore().users.list()).find((item) => item.id === userId && item.role !== 'guest')
  if (!user) throw Errors.missing(`User ${userId} not found`)
  return user
}

export const quotaService = {
  async forUser(user: User, now = new Date()): Promise<ScanQuota> {
    const day = israelDay(now)
    const store = getStore()
    const [used, adjustments] = await Promise.all([
      store.scanQuota.countAddPlant(user.id, israelMidnight(day).toISOString()),
      store.scanQuota.adjustments(user.id, day),
    ])
    const extra = adjustments.filter((item) => item.kind === 'extra').reduce((sum, item) => sum + item.delta, 0)
    return quotaOf(user, used, extra, day)
  },

  /**
   * Before an Add Plant scan: throws 429 `quota` when none are left. The admin is never limited.
   * A failing quota read lets the scan through (logged) rather than blocking every member.
   */
  async assertCanScan(user: User) {
    if (user.role === 'admin') return
    let quota: ScanQuota
    try {
      quota = await quotaService.forUser(user)
    } catch (err) {
      logger.warn('scan quota unavailable; allowing the scan', { userId: user.id }, err)
      return
    }
    if (quota.remaining <= 0) throw Errors.quota(quota)
  },

  /** Admin → Server users: today's usage for everyone. */
  async overview() {
    const day = israelDay()
    const store = getStore()
    const [users, used, extras] = await Promise.all([
      store.users.list(),
      store.scanQuota.usedByUser(israelMidnight(day).toISOString()),
      store.scanQuota.extrasByUser(day),
    ])
    return Object.fromEntries(
      users
        .filter((user) => user.role !== 'guest')
        .map((user) => [user.id, quotaOf(user, used[user.id] ?? 0, extras[user.id] ?? 0, day)]),
    ) as Record<string, ScanQuota>
  },

  async detail(userId: string) {
    const user = await findUser(userId)
    const [quota, history] = await Promise.all([quotaService.forUser(user), getStore().scanQuota.adjustments(userId)])
    return { quota, history }
  },

  /** Extra scans for today (negative takes away). */
  async giveExtra(userId: string, delta: number, reason: string, adminId: string) {
    if (!Number.isInteger(delta) || delta === 0 || Math.abs(delta) > 100) throw Errors.invalid('delta must be a whole number from -100 to 100, not 0')
    await findUser(userId)
    await getStore().scanQuota.add(adjustment(userId, 'extra', { delta, value: null }, reason, adminId))
    return quotaService.detail(userId)
  },

  /** A member's daily limit; null = back to the default. */
  async setLimit(userId: string, limit: number | null, reason: string, adminId: string) {
    if (limit != null && (!Number.isInteger(limit) || limit < 0 || limit > 1000)) {
      throw Errors.invalid('limit must be a whole number from 0 to 1000, or empty for the default')
    }
    await findUser(userId)
    const store = getStore()
    await store.scanQuota.setLimit(userId, limit)
    await store.scanQuota.add(adjustment(userId, 'limit', { delta: 0, value: limit }, reason, adminId))
    return quotaService.detail(userId)
  },
}

function adjustment(
  userId: string,
  kind: ScanAdjustment['kind'],
  change: { delta: number; value: number | null },
  reason: string,
  adminId: string,
): ScanAdjustment {
  return {
    id: `scan-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    userId,
    day: israelDay(),
    kind,
    delta: change.delta,
    value: change.value,
    reason: reason.trim().slice(0, 200),
    createdBy: adminId,
    createdAt: new Date().toISOString(),
  }
}
