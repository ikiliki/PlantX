import { getStore } from '../../db/index.ts'
import { Errors } from '../../lib/errors.ts'
import type { ActivityComment, User } from '../../../../src/mock/types.ts'
import { activityService, visibleTo } from '../activity/activity.service.ts'

export const COMMENT_MAX = 500

type Viewer = Pick<User, 'id' | 'role'>

/** The activity, if this viewer may see it (same rules as every activity list). */
async function seenActivity(activityId: string, viewer: Viewer) {
  const activity = await activityService.get(activityId)
  if (!activity) throw Errors.missing('Activity not found')
  const [visible] = await visibleTo([activity], viewer)
  if (!visible) throw Errors.missing('Activity not found')
  return visible
}

async function reactionState(activityId: string, viewer: Viewer) {
  const counts = await getStore().activitySocial.counts([activityId], viewer.id)
  const entry = counts.get(activityId)
  return { reactions: entry?.reactions ?? 0, reacted: entry?.reacted ?? false }
}

/**
 * 🌿 reactions and comments on feed posts. Anyone signed in who can see an activity may react and comment.
 * A comment is removed (soft) by its author, the post's owner, or an admin.
 */
export const feedSocialService = {
  async react(activityId: string, viewer: Viewer, on: boolean) {
    await seenActivity(activityId, viewer)
    const social = getStore().activitySocial
    if (on) await social.react(activityId, viewer.id)
    else await social.unreact(activityId, viewer.id)
    return reactionState(activityId, viewer)
  },

  async comments(activityId: string, viewer: Viewer): Promise<ActivityComment[]> {
    await seenActivity(activityId, viewer)
    return getStore().activitySocial.comments(activityId)
  },

  async addComment(activityId: string, viewer: Viewer, raw: unknown): Promise<ActivityComment> {
    const body = typeof raw === 'string' ? raw.trim() : ''
    if (body.length < 1 || body.length > COMMENT_MAX) {
      throw Errors.invalid(`A comment is 1 to ${COMMENT_MAX} characters`)
    }
    await seenActivity(activityId, viewer)
    return getStore().activitySocial.addComment({ activityId, userId: viewer.id, body })
  },

  async deleteComment(commentId: string, viewer: Viewer) {
    const social = getStore().activitySocial
    const comment = await social.getComment(commentId)
    if (!comment) throw Errors.missing('Comment not found')
    const activity = await activityService.get(comment.activityId)
    const allowed = viewer.role === 'admin' || comment.userId === viewer.id || activity?.userId === viewer.id
    if (!allowed) throw Errors.forbidden('Only the author, the post owner or an admin can remove this comment')
    await social.softDeleteComment(commentId)
  },
}
