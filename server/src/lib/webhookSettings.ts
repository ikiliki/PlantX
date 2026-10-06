import type { WebhookId, WebhookStatus } from '../../../src/mock/types.ts'
import { getStore } from '../db/index.ts'
import { logger } from './logger.ts'
import { postWebhook } from './webhook.ts'

/**
 * Admin → Webhooks: which env URL each webhook posts to, and its on/off switch (`webhook_settings`, no row = on).
 * The URLs live only in env; the admin sees whether each is set, never the value.
 * The switches are cached for 30 s per instance, so a change reaches every instance within half a minute.
 */
export const WEBHOOKS: { id: WebhookId; env: WebhookStatus['env'] }[] = [
  { id: 'alerts', env: 'PLANTX_ALERT_WEBHOOK_URL' },
  { id: 'signups', env: 'PLANTX_EVENTS_WEBHOOK_URL' },
  { id: 'signins', env: 'PLANTX_EVENTS_WEBHOOK_URL' },
  { id: 'activities', env: 'PLANTX_EVENTS_WEBHOOK_URL' },
]

const CACHE_MS = 30_000
let cache: { at: number; flags: Partial<Record<WebhookId, boolean>> } | null = null

export function webhookUrl(id: WebhookId) {
  const env = WEBHOOKS.find((item) => item.id === id)?.env
  return env ? (process.env[env] || '').trim() : ''
}

async function flags() {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.flags
  try {
    cache = { at: Date.now(), flags: await getStore().webhookSettings.get() }
  } catch (err) {
    // A database hiccup must not silence alerts: keep the last switches, or treat them as on.
    logger.warn('webhook settings read failed', {}, err)
    cache = { at: Date.now(), flags: cache?.flags ?? {} }
  }
  return cache.flags
}

/** The URL to post to when this webhook is set and switched on; empty otherwise. */
export async function activeWebhookUrl(id: WebhookId) {
  const url = webhookUrl(id)
  if (!url) return ''
  return (await flags())[id] === false ? '' : url
}

export async function webhookStatuses(): Promise<WebhookStatus[]> {
  cache = null
  const current = await flags()
  return WEBHOOKS.map((item) => ({ ...item, configured: Boolean(webhookUrl(item.id)), enabled: current[item.id] !== false }))
}

export async function setWebhookEnabled(id: WebhookId, enabled: boolean) {
  await getStore().webhookSettings.set(id, enabled)
  cache = null
}

/** Admin's Send test: one line, even while the switch is off, so the channel can be checked first. */
export async function sendWebhookTest(id: WebhookId, by: string) {
  const url = webhookUrl(id)
  if (!url) return false
  const where = process.env.VERCEL_ENV === 'production' ? 'production' : 'preview'
  await postWebhook(url, `🧪 PlantX ${where} · test for "${id}" from ${by}`, `test-${id}`)
  return true
}

export function isWebhookId(value: unknown): value is WebhookId {
  return WEBHOOKS.some((item) => item.id === value)
}
