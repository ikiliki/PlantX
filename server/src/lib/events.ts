import { isPublicActivity } from '../../../src/features/feed/activityXp.ts'
import { sharedGrowerName } from '../../../src/features/profile/avatarIcons.ts'
import type { FeedUpdateKind, User, WebhookId } from '../../../src/mock/types.ts'
import type { Activity } from '../features/activity/activity.types.ts'
import { getStore } from '../db/index.ts'
import { logger } from './logger.ts'
import { loadVisibility, visibleActivities } from './visibility.ts'
import { postWebhook } from './webhook.ts'
import { activeWebhookUrl, webhookUrl } from './webhookSettings.ts'

/**
 * Community events for the operator's channel: sign-ups (with the email, to approve them), approvals,
 * sign-ins and public activities. Set `PLANTX_EVENTS_WEBHOOK_URL` per Vercel environment; unset, nothing
 * is sent. Admin → Webhooks switches each kind on or off. Growers appear by their public name (nickname);
 * an activity is posted only when a signed-out visitor could see it: an XP kind, not about a private plant,
 * not hidden by an admin. Every call is awaited after the work succeeded and never throws.
 */

/** One line, no markdown control characters from user text. */
function plain(text: string, max = 120) {
  return text.replace(/[\r\n]+/g, ' ').replace(/[*_~`|>]/g, '').trim().slice(0, max)
}

async function post(id: WebhookId, text: string) {
  const url = await activeWebhookUrl(id)
  if (!url) return
  const where = process.env.VERCEL_ENV === 'production' ? '' : '[PP] '
  await postWebhook(url, `${where}${text}`, id)
}

export async function notifySignUp(name: string, email: string) {
  await post('signups', `🆕 Sign-up waiting: ${plain(name)} (${plain(email)}) · approve in Admin → Requests`)
}

export async function notifyApproved(name: string) {
  await post('signups', `✅ ${plain(name)} was approved and can sign in`)
}

export async function notifySignIn(user: User) {
  await post('signins', `🔑 ${plain(sharedGrowerName(user))} signed in`)
}

const KIND_MARK: Partial<Record<FeedUpdateKind, string>> = { added: '🌱', water: '💧', photo: '📸' }

export async function notifyActivity(activity: Activity) {
  if (!webhookUrl('activities') || !isPublicActivity(activity.kind)) return
  try {
    const [index, users] = await Promise.all([loadVisibility(), getStore().users.list()])
    if (visibleActivities([activity], index, null).length === 0) return
    const user = users.find((item) => item.id === activity.userId)
    const who = user ? sharedGrowerName(user) : 'A grower'
    await post('activities', `${KIND_MARK[activity.kind] ?? '•'} ${plain(who)} · ${plain(activity.body, 200)}`)
  } catch (err) {
    logger.warn('activity event failed', { activityId: activity.id }, err)
  }
}
