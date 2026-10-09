import { useState } from 'react'
import { Avatar } from '../../../../components/Avatar/Avatar'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { FeedUpdate } from '../../../../mock/types'
import { publicGrowerName } from '../../../profile/avatarIcons'
import { formatFeedTime } from '../../formatFeedTime'
import { COMMENT_MAX, canSendComment, useComments } from '../../useComments'
import {
  Body,
  Composer,
  Delete,
  Empty,
  Error,
  Field,
  Item,
  List,
  Meta,
  Name,
  Root,
  Send,
  Text,
  When,
} from './CommentThread.styles'

/**
 * A post's comments, oldest first, then a box to add one. A comment can be removed by its author, the
 * post's owner, or an admin (the server checks the same).
 */
export function CommentThread({ update }: { update: FeedUpdate }) {
  const { t, locale } = useI18n()
  const { db, currentUser } = useStore()
  const { comments, loading, add, remove } = useComments(update.id)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState(false)
  const ready = canSendComment(text) && !sending

  const send = async () => {
    if (!ready) return
    setSending(true)
    setFailed(false)
    const ok = await add(text)
    setSending(false)
    if (ok) setText('')
    else setFailed(true)
  }

  const canDelete = (authorId: string) =>
    Boolean(currentUser && (currentUser.role === 'admin' || currentUser.id === authorId || currentUser.id === update.userId))

  return (
    <Root data-comment-thread>
      {loading ? (
        <Empty aria-busy>{t.feedPage.commentsLoading}</Empty>
      ) : comments.length === 0 ? (
        <Empty>{t.feedPage.noComments}</Empty>
      ) : (
        <List>
          {comments.map((comment) => {
            const author = db.users.find((user) => user.id === comment.userId)
            const name =
              (author ? publicGrowerName(author, locale === 'he') : '') +
              (currentUser && comment.userId === currentUser.id ? ` ${t.feed.youMark}` : '')
            return (
              <Item key={comment.id} data-comment={comment.id}>
                {author ? <Avatar name={name} color={author.avatarColor} icon={author.avatarIcon} size={28} /> : <span />}
                <Body>
                  <Meta>
                    <Name>{name}</Name>
                    <When dateTime={comment.createdAt}>{formatFeedTime(comment.createdAt, locale, t.feed)}</When>
                    {canDelete(comment.userId) ? (
                      <Delete type="button" onClick={() => void remove(comment.id)}>
                        {t.feedPage.deleteComment}
                      </Delete>
                    ) : null}
                  </Meta>
                  <Text>{comment.body}</Text>
                </Body>
              </Item>
            )
          })}
        </List>
      )}
      {currentUser ? (
        <Composer
          onSubmit={(event) => {
            event.preventDefault()
            void send()
          }}
        >
          <Field
            id={`comment-${update.id}`}
            aria-label={t.feedPage.commentPlaceholder}
            placeholder={t.feedPage.commentPlaceholder}
            value={text}
            maxLength={COMMENT_MAX}
            rows={1}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void send()
              }
            }}
          />
          <Send type="submit" disabled={!ready}>
            {t.feedPage.send}
          </Send>
        </Composer>
      ) : null}
      {failed ? <Error role="alert">{t.feedPage.commentFailed}</Error> : null}
    </Root>
  )
}
