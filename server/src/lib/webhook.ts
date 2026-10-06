import { logger } from './logger.ts'

const TIMEOUT_MS = 2_000

/**
 * Post one line to a Slack / Discord style incoming webhook. Never throws and never waits more than 2 s,
 * so a slow or broken webhook cannot fail the request that triggered it. Mentions are off: a grower's
 * name or a crash message containing `@everyone` stays plain text.
 */
export async function postWebhook(url: string, text: string, label: string) {
  if (!url) return
  try {
    // `text` for Slack, `content` + `allowed_mentions` for Discord.
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, content: text.slice(0, 1900), allowed_mentions: { parse: [] } }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (err) {
    logger.warn('webhook post failed', { label }, err)
  }
}
