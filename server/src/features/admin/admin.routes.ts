import { Hono } from 'hono'
import type { ModerationAction, ModerationTarget, User, Visibility } from '../../../../src/mock/types.ts'
import { getStore } from '../../db/index.ts'
import { Errors } from '../../lib/errors.ts'
import { requireAdmin } from '../../lib/session.ts'
import { isWebhookId, sendWebhookTest, setWebhookEnabled, webhookStatuses } from '../../lib/webhookSettings.ts'
import { moderationService } from '../moderation/moderation.service.ts'
import { feedSocialService } from '../feed-social/feedSocial.service.ts'
import { quotaService } from '../quota/quota.service.ts'

/** Operator console API. Every route is admin-only. */
export const adminRoutes = new Hono()

const TYPES: ModerationTarget[] = ['user', 'plant', 'activity']
const ACTIONS: ModerationAction[] = ['hide', 'show', 'delete', 'restore']
const STATES = ['all', 'moderated', 'visible', 'hidden', 'deleted'] as const

function readType(value: string | undefined): ModerationTarget {
  if (!value || !(TYPES as string[]).includes(value)) throw Errors.invalid(`type must be one of ${TYPES.join(', ')}`)
  return value as ModerationTarget
}

function text(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : undefined
}

// ── Webhooks ────────────────────────────────────────────────────────────────

/** Each outgoing webhook: its env name, whether that is set (never the URL), and its on/off switch. */
adminRoutes.get('/webhooks', async (c) => {
  await requireAdmin(c)
  return c.json({ webhooks: await webhookStatuses() })
})

adminRoutes.put('/webhooks/:id', async (c) => {
  await requireAdmin(c)
  const id = c.req.param('id')
  if (!isWebhookId(id)) throw Errors.invalid('Unknown webhook')
  const body = (await c.req.json().catch(() => null)) as { enabled?: unknown } | null
  if (typeof body?.enabled !== 'boolean') throw Errors.invalid('enabled must be true or false')
  await setWebhookEnabled(id, body.enabled)
  return c.json({ webhooks: await webhookStatuses() })
})

/** Posts one test line, even while switched off. 409 when its env URL is not set. */
adminRoutes.post('/webhooks/:id/test', async (c) => {
  const admin = await requireAdmin(c)
  const id = c.req.param('id')
  if (!isWebhookId(id)) throw Errors.invalid('Unknown webhook')
  if (!(await sendWebhookTest(id, admin.nickname || admin.name))) {
    return c.json({ error: 'not_configured', message: 'Its env URL is not set on this deployment' }, 409)
  }
  return c.json({ sent: true })
})

// ── Moderation (#68, #69) ───────────────────────────────────────────────────

adminRoutes.get('/moderation/items', async (c) => {
  await requireAdmin(c)
  const raw = c.req.query('state') ?? 'all'
  const state = (STATES as readonly string[]).includes(raw) ? (raw as Visibility | 'all' | 'moderated') : 'all'
  return c.json({ items: await moderationService.items(readType(c.req.query('type')), state, c.req.query('q') ?? '') })
})

/** What hiding or deleting this row also takes out of view. Shown before the admin confirms. */
adminRoutes.get('/moderation/impact', async (c) => {
  await requireAdmin(c)
  const id = c.req.query('id')
  if (!id) throw Errors.invalid('id is required')
  return c.json(await moderationService.impact(readType(c.req.query('type')), id))
})

adminRoutes.post('/moderation/:type/:id', async (c) => {
  const admin = await requireAdmin(c)
  const body = (await c.req.json().catch(() => ({}))) as { action?: unknown; reason?: unknown }
  const action = body.action as ModerationAction
  if (!(ACTIONS as string[]).includes(action)) throw Errors.invalid(`action must be one of ${ACTIONS.join(', ')}`)
  const result = await moderationService.apply(
    readType(c.req.param('type')),
    c.req.param('id'),
    action,
    text(body.reason, 300) ?? '',
    admin,
  )
  return c.json(result)
})

/** Newest Feed comments, with author and post (remove one with DELETE /api/comments/:id). */
adminRoutes.get('/comments', async (c) => {
  await requireAdmin(c)
  return c.json({ comments: await feedSocialService.recent(100) })
})

adminRoutes.get('/moderation/log', async (c) => {
  await requireAdmin(c)
  return c.json({ entries: await moderationService.log(100) })
})

// ── User edit (#68) ──────────────────────────────────────────────────────────

/** Admin edits a member's profile fields. Role and email stay as they are. */
adminRoutes.patch('/users/:id', async (c) => {
  const admin = await requireAdmin(c)
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>
  const store = getStore()
  const users = await store.users.list()
  const user = users.find((item) => item.id === c.req.param('id') && item.role !== 'guest')
  if (!user) throw Errors.missing('User not found')
  const next: User = { ...user }
  const changed: string[] = []
  const fields: [keyof User, number][] = [
    ['name', 60],
    ['nickname', 40],
    ['bio', 300],
    ['bioHe', 300],
    ['region', 60],
    ['regionHe', 60],
  ]
  for (const [key, max] of fields) {
    const value = text(body[key], max)
    if (value === undefined || value === user[key]) continue
    if (key === 'name' && !value) throw Errors.invalid('Name is required')
    ;(next as unknown as Record<string, unknown>)[key] = value
    changed.push(String(key))
  }
  if (changed.length > 0) {
    await store.users.upsert([next])
    await moderationService.logEdit('user', next.id, next.nickname || next.name, admin, changed)
  }
  return c.json({ user: next, changed })
})

// ── AI scan quota (#67) ──────────────────────────────────────────────────────

/** Today's scans for every member, keyed by user id (Admin → Server users column). */
adminRoutes.get('/scans', async (c) => {
  await requireAdmin(c)
  return c.json({ quotas: await quotaService.overview() })
})

adminRoutes.get('/scans/:userId', async (c) => {
  await requireAdmin(c)
  return c.json(await quotaService.detail(c.req.param('userId')))
})

/** `{ kind: 'extra', delta, reason }` for today, or `{ kind: 'limit', limit | null, reason }`. */
adminRoutes.post('/scans/:userId', async (c) => {
  const admin = await requireAdmin(c)
  const body = (await c.req.json().catch(() => ({}))) as { kind?: unknown; delta?: unknown; limit?: unknown; reason?: unknown }
  const reason = text(body.reason, 200) ?? ''
  const userId = c.req.param('userId')
  if (body.kind === 'extra') return c.json(await quotaService.giveExtra(userId, Number(body.delta), reason, admin.id))
  if (body.kind === 'limit') {
    const limit = body.limit === null || body.limit === '' ? null : Number(body.limit)
    return c.json(await quotaService.setLimit(userId, limit, reason, admin.id))
  }
  throw Errors.invalid("kind must be 'extra' or 'limit'")
})

// ── Scans not in the catalog (#64) ───────────────────────────────────────────

/**
 * Add Plant scans that recognized a plant the catalog lacks, grouped by plant. Read-only: nothing here is
 * a suggestion. Members suggest from the app; an admin can still use New catalog entry.
 */
adminRoutes.get('/scans-not-in-catalog', async (c) => {
  await requireAdmin(c)
  const records = await getStore().identifyRequests.list({ limit: 400 })
  const groups = new Map<
    string,
    { name: string; scientificName: string; scans: number; members: Set<string>; lastAt: string; thumb?: string }
  >()
  for (const record of records) {
    const diagnosis = record.diagnosis
    if (record.source !== 'addPlant' || !diagnosis?.isPlant || diagnosis.draft?.categoryId) continue
    const scientificName = diagnosis.scientificName?.trim() || ''
    const name = diagnosis.commonNames?.find(Boolean) || diagnosis.label || scientificName
    const key = (scientificName || name).toLowerCase()
    if (!key) continue
    const group = groups.get(key) ?? { name, scientificName, scans: 0, members: new Set<string>(), lastAt: record.createdAt }
    group.scans += 1
    group.members.add(record.userId)
    if (record.createdAt >= group.lastAt) {
      group.lastAt = record.createdAt
      group.thumb = record.thumb ?? group.thumb
    }
    groups.set(key, group)
  }
  const scans = [...groups.values()]
    .sort((a, b) => b.lastAt.localeCompare(a.lastAt))
    .slice(0, 100)
    .map(({ members, ...group }) => ({ ...group, members: members.size }))
  return c.json({ scans })
})
