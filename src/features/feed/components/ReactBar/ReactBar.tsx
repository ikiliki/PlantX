import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { FeedUpdate } from '../../../../mock/types'
import { Bar, Count, Leaf, Pill } from './ReactBar.styles'

/**
 * 🌿 and 💬 under a feed post. The leaf toggles this member's reaction; the bubble opens the comments.
 * `readOnly` (Home's preview, a guest): counts only, nothing to press.
 */
export function ReactBar({
  update,
  onComments,
  commentsOpen = false,
  readOnly = false,
}: {
  update: FeedUpdate
  onComments?: () => void
  commentsOpen?: boolean
  readOnly?: boolean
}) {
  const { t } = useI18n()
  const { signedIn, reactToUpdate } = useStore()
  const reactions = update.reactions ?? 0
  const comments = update.comments ?? 0
  const reacted = Boolean(update.reacted)
  const commentLabel =
    comments === 0 ? t.feedPage.commentNone : comments === 1 ? t.feedPage.commentOne : t.feedPage.comments.replace('{n}', String(comments))
  const inert = readOnly || !signedIn

  if (inert) {
    if (reactions === 0 && comments === 0) return null
    return (
      <Bar data-react-bar>
        {reactions > 0 ? (
          <Count>
            <Leaf aria-hidden>🌿</Leaf>
            {reactions}
          </Count>
        ) : null}
        {comments > 0 ? (
          <Count>
            <span aria-hidden>💬</span>
            {comments}
          </Count>
        ) : null}
      </Bar>
    )
  }

  return (
    <Bar data-react-bar>
      <Pill
        type="button"
        $on={reacted}
        aria-pressed={reacted}
        aria-label={`${reacted ? t.feedPage.reacted : t.feedPage.react} · ${reactions}`}
        title={reacted ? t.feedPage.reacted : t.feedPage.react}
        onClick={() => reactToUpdate(update.id, !reacted)}
        data-react
      >
        <Leaf aria-hidden $on={reacted}>
          🌿
        </Leaf>
        <span>{reactions}</span>
      </Pill>
      {onComments ? (
        <Pill type="button" $on={commentsOpen} aria-expanded={commentsOpen} onClick={onComments} data-comments-toggle>
          <span aria-hidden>💬</span>
          <span>{commentLabel}</span>
        </Pill>
      ) : null}
    </Bar>
  )
}
