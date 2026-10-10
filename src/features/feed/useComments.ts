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

/**
 * Send one comment without loading the thread (the preview under a post). Moves the post's count and
 * preview; resolves the new comment, or null when it could not be sent.
 */
export function useSendComment(activityId: string) {
  const { liveWritable, currentUser, bumpCommentCount } = useStore()
  return useCallback(
    async (text: string): Promise<ActivityComment | null> => {
      if (!canSendComment(text) || !currentUser) return null
      const body = text.trim()
      let comment: ActivityComment
      if (!liveWritable) {
        comment = { id: `comment-${Date.now()}`, activityId, userId: currentUser.id, body, createdAt: new Date().toISOString() }
        mockComments.set(activityId, [...(mockComments.get(activityId) ?? []), comment])
      } else {
        const res = await postComment(activityId, body)
        if (!res) return null
        comment = res.comment
      }
      bumpCommentCount(activityId, 1, { added: comment })
      return comment
    },
    [activityId, bumpCommentCount, currentUser, liveWritable],
  )
}

/** One post's comments: loads on mount, and keeps the post's comment count in step on add / remove. */
export function useComments(activityId: string) {
  const { liveWritable, bumpCommentCount } = useStore()
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

  const send = useSendComment(activityId)
  const add = useCallback(
    async (text: string) => {
      const comment = await send(text)
      if (comment) setComments((list) => [...list, comment])
      return Boolean(comment)
    },
    [send],
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
      bumpCommentCount(activityId, -1, { removedId: commentId })
      return true
    },
    [activityId, bumpCommentCount, liveWritable],
  )

  return { comments, loading, add, remove }
}
