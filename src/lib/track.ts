import type { AnalyticsProps } from '../mock/types'
import { clientEnv } from '../theme/plantxEnv'
import type { ClientEventName } from './analytics'

const sentOnce = new Set<string>()

/**
 * A browser funnel step (#59): landing view, guest start, sign-up start, Add Plant start. Fire and forget:
 * it never waits, never throws and never retries. Mock mode has no server, so nothing is sent.
 * `once` sends a step at most once per page load.
 */
export function track(name: ClientEventName, props: AnalyticsProps = {}, { once = false } = {}) {
  if (clientEnv() === 'mock' || typeof window === 'undefined') return
  if (once) {
    if (sentOnce.has(name)) return
    sentOnce.add(name)
  }
  void fetch('/api/events', {
    method: 'POST',
    credentials: 'include',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, props }),
  }).catch(() => undefined)
}
