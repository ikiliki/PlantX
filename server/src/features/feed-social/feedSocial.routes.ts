import { Hono } from 'hono'
import { rateLimit } from '../../lib/rateLimit.ts'
import { signedIn, type SignedInEnv } from '../../lib/session.ts'
import { moderationService } from '../moderation/moderation.service.ts'
import { feedSocialService } from './feedSocial.service.ts'

/**
 * Reactions and comments on one activity, mounted under `/api/activities` before the activity list routes
 * (so `/:id/comments` is not read as `/:type/:userId`). Members only.
 */
export const activitySocialRoutes = new Hono<SignedInEnv>()

activitySocialRoutes.use('*', signedIn)

/** 🌿 and comments other growers left on your posts (Greenhouse activities → Social). */
activitySocialRoutes.get('/social/mine', async (c) => c.json({ items: await feedSocialService.mine(c.get('user').id) }))

activitySocialRoutes.put('/:id/reaction', async (c) => c.json(await feedSocialService.react(c.req.param('id'), c.get('user'), true)))

activitySocialRoutes.delete('/:id/reaction', async (c) =>
  c.json(await feedSocialService.react(c.req.param('id'), c.get('user'), false)),
)

activitySocialRoutes.get('/:id/comments', async (c) =>
  c.json({ comments: await feedSocialService.comments(c.req.param('id'), c.get('user')) }),
)

activitySocialRoutes.post('/:id/comments', rateLimit({ name: 'comment', max: 10, windowSeconds: 60 }), async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { body?: unknown }
  const comment = await feedSocialService.addComment(c.req.param('id'), c.get('user'), body.body)
  return c.json({ comment }, 201)
})

/** `DELETE /api/comments/:id`: the author, the post's owner, or an admin. */
export const commentRoutes = new Hono<SignedInEnv>()

commentRoutes.use('*', signedIn)

commentRoutes.delete('/:id', async (c) => {
  const user = c.get('user')
  const { comment, byModerator } = await feedSocialService.deleteComment(c.req.param('id'), user)
  // An admin removing someone else's comment goes in the moderation log, on the post.
  if (byModerator) {
    await moderationService.logEdit('activity', comment.activityId, `Comment: ${comment.body.slice(0, 60)}`, user, ['comment removed'])
  }
  return c.json({ ok: true })
})
