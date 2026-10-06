import { logger } from './logger.ts'

/**
 * Failures a human should hear about (#56): server 5xx and browser crashes. Each one is logged; when
 * `PLANTX_ALERT_WEBHOOK_URL` is set (a Slack / Discord style incoming webhook), it is also posted there,
 * at most once per message every 10 minutes. Counts live in this process only: a Vercel instance
 * reports what it saw since it started, which is enough to tell "quiet" from "failing".
 */
export type FailureSource = 'server' | 'client'

type Counter = { count: number; lastAt: string | null; lastMessage: string | null }

const bootedAt = new Date().toISOString()
const counters: Record<FailureSource, Counter> = {
  server: { count: 0, lastAt: null, lastMessage: null },
  client: { count: 0, lastAt: null, lastMessage: null },
}

const ALERT_EVERY_MS = 10 * 60_000
const ALERT_TIMEOUT_MS = 2_000
const sentAt = new Map<string, number>()

function webhookUrl() {
  return (process.env.PLANTX_ALERT_WEBHOOK_URL || '').trim()
}

export function alertsConfigured() {
  return Boolean(webhookUrl())
}

async function sendAlert(text: string, key: string) {
  const url = webhookUrl()
  if (!url) return
  const now = Date.now()
  if (now - (sentAt.get(key) ?? 0) < ALERT_EVERY_MS) return
  sentAt.set(key, now)
  if (sentAt.size > 200) sentAt.clear()
  try {
    // `text` for Slack, `content` for Discord.
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, content: text }),
      signal: AbortSignal.timeout(ALERT_TIMEOUT_MS),
    })
  } catch (err) {
    logger.warn('alert webhook failed', { key }, err)
  }
}

/** Count a failure and alert a human. Awaited by the caller so a serverless function does not drop the post. */
export async function recordFailure(
  source: FailureSource,
  message: string,
  meta: { requestId?: string; path?: string } = {},
) {
  const counter = counters[source]
  counter.count += 1
  counter.lastAt = new Date().toISOString()
  counter.lastMessage = message.slice(0, 200)
  const env = process.env.VERCEL_ENV || process.env.PLANTX_ENV || 'local'
  const where = [meta.path, meta.requestId && `request ${meta.requestId}`].filter(Boolean).join(' · ')
  await sendAlert(`PlantX ${env} · ${source} error: ${counter.lastMessage}${where ? ` (${where})` : ''}`, `${source}|${counter.lastMessage}`)
}

export function failureSummary() {
  return { since: bootedAt, server: { ...counters.server }, client: { ...counters.client } }
}
