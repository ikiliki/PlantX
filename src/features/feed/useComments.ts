import { useCallback, useEffect, useState } from 'react'
import { deleteComment, fetchComments, postComment } from '../../mock/liveApi'
import { useStore } from '../../mock/store'
import type { ActivityComment } from '../../mock/types'

export const COMMENT_MAX = 500

/** Mock mode: comments live for this browser session only (nothing to sync with). */
const mockComments = new Map<string, ActivityComment[]>()

/** True when the text can be sent: 1 to 500 characters once trimmed. */
export function canSendComment(text: string) {
  const length = text.trim().length
  return length >= 1 && length <= COMMENT_MAX
}

/** One post's comments: loads on mount, and keeps the post's comment count in step on add / remove. */
export function useComments(activityId: string) {
  const { liveWritable, currentUser, bumpCommentCount } = useStore()
  const [comments, setComments] = useState<ActivityComment[]>(() => (liveWritable ? [] : (mockComments.get(activityId) ?? [])))
  const [loading, setLoading] = useState(liveWritable)

  useEffect(() => {
    if (!liveWritable) return
    let cancelled = false
    setLoading(true)
    void fetchComments(activityId).then((res) => {
      if (cancelled) return
      if (res) setComments(res.comments)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [activityId, liveWritable])

  const add = useCallback(
    async (text: string) => {
      if (!canSendComment(text) || !currentUser) return false
      const body = text.trim()
      if (!liveWritable) {
        const comment: ActivityComment = {
          id: `comment-${Date.now()}`,
          activityId,
          userId: currentUser.id,
          body,
          createdAt: new Date().toISOString(),
        }
        const next = [...(mockComments.get(activityId) ?? []), comment]
        mockComments.set(activityId, next)
        setComments(next)
        bumpCommentCount(activityId, 1)
        return true
      }
      const res = await postComment(activityId, body)
      if (!res) return false
      setComments((list) => [...list, res.comment])
      bumpCommentCount(activityId, 1)
      return true
    },
    [activityId, bumpCommentCount, currentUser, liveWritable],
  )

  const remove = useCallback(
    async (commentId: string) => {
      if (liveWritable) {
        const res = await deleteComment(commentId)
        if (!res) return false
      } else {
        mockComments.set(
          activityId,
          (mockComments.get(activityId) ?? []).filter((comment) => comment.id !== commentId),
        )
      }
      setComments((list) => list.filter((comment) => comment.id !== commentId))
      bumpCommentCount(activityId, -1)
      return true
    },
    [activityId, bumpCommentCount, liveWritable],
  )

  return { comments, loading, add, remove }
}
