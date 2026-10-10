import { useState } from 'react'
import { Avatar } from '../../../../components/Avatar/Avatar'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { FeedUpdate } from '../../../../mock/types'
import { publicGrowerName } from '../../../profile/avatarIcons'
import { COMMENT_MAX, canSendComment, useSendComment } from '../../useComments'
import { Bubble, Composer, Error, Field, Item, List, Name, Root, Send, ViewAll } from './CommentPreview.styles'

/**
 * Under a post's 🌿 row, like Facebook: its two newest comments (sent with the post, no extra request),
 * "View all n comments" when there are more, then a one-line "Write a comment…" box. No comments: only the box.
 */
export function CommentPreview({ update, onViewAll }: { update: FeedUpdate; onViewAll: () => void }) {
  const { t, locale } = useI18n()
  const { db, currentUser } = useStore()
  const send = useSendComment(update.id)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState(false)
  const latest = update.latestComments ?? []
  const total = update.comments ?? latest.length
  const ready = canSendComment(text) && !sending

  if (!currentUser) return null
  const me = publicGrowerName(currentUser, locale === 'he')

  const submit = async () => {
    if (!ready) return
    setSending(true)
    setFailed(false)
    const comment = await send(text)
    setSending(false)
    if (comment) setText('')
    else setFailed(true)
  }

  return (
    <Root data-comment-preview>
      {total > latest.length ? (
        <ViewAll type="button" onClick={onViewAll} data-comments-all>
          {t.feedPage.viewAllComments.replace('{n}', String(total))}
        </ViewAll>
      ) : null}
      {latest.length > 0 ? (
        <List>
          {latest.map((comment) => {
            const author = db.users.find((user) => user.id === comment.userId)
            const name =
              (author ? publicGrowerName(author, locale === 'he') : '') +
              (comment.userId === currentUser.id ? ` ${t.feed.youMark}` : '')
            return (
              <Item key={comment.id} data-comment={comment.id}>
                {author ? <Avatar name={name} color={author.avatarColor} icon={author.avatarIcon} size={24} /> : <span />}
                <Bubble>
                  <Name>{name}</Name> {comment.body}
                </Bubble>
              </Item>
            )
          })}
        </List>
      ) : null}
      <Composer
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <Avatar name={me} color={currentUser.avatarColor} icon={currentUser.avatarIcon} size={24} />
        <Field
          aria-label={t.feedPage.commentPlaceholder}
          placeholder={t.feedPage.commentPlaceholder}
          value={text}
          maxLength={COMMENT_MAX}
          onChange={(event) => setText(event.target.value)}
          data-comment-field
        />
        {text.trim() ? (
          <Send type="submit" disabled={!ready}>
            {t.feedPage.send}
          </Send>
        ) : null}
      </Composer>
      {failed ? <Error role="alert">{t.feedPage.commentFailed}</Error> : null}
    </Root>
  )
}
