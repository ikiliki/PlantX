import { useCallback, useEffect, useState } from 'react'
import { useI18n } from '../../../../i18n/I18nProvider'
import { deleteComment, fetchAdminCommentsOutcome } from '../../../../mock/liveApi'
import { useStore } from '../../../../mock/store'
import type { AdminComment } from '../../../../mock/types'
import { AdminSection } from '../AdminSection/AdminSection'
import { AdminTable } from '../AdminTable/AdminTable'
import { Body, Note } from './CommentModeration.styles'

/**
 * Admin → Moderation → Comments: the newest Feed comments with their author and post. Remove takes a comment
 * out for everyone (soft delete) and writes it to the moderation log on that post. `readOnly` (Admin → Server):
 * the same table without Remove.
 */
export function CommentModeration({ readOnly = false }: { readOnly?: boolean }) {
  const { t, locale } = useI18n()
  const { plantxEnv } = useStore()
  const mock = plantxEnv === 'mock'
  const [comments, setComments] = useState<AdminComment[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (mock) return
    setFailed(false)
    const res = await fetchAdminCommentsOutcome()
    if (res.ok) setComments(res.data.comments)
    else setFailed(true)
  }, [mock])

  useEffect(() => {
    void load()
  }, [load])

  const remove = async (comment: AdminComment) => {
    setBusyId(comment.id)
    const res = await deleteComment(comment.id)
    setBusyId(null)
    if (res) setComments((list) => (list ?? []).filter((item) => item.id !== comment.id))
  }

  const when = (iso: string) =>
    new Date(iso).toLocaleString(locale === 'he' ? 'he-IL' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  return (
    <AdminSection title={t.admin.commentsTitle} lead={readOnly ? t.admin.commentsLeadServer : t.admin.commentsLead}>
      {mock ? (
        <Note>{t.admin.commentsMock}</Note>
      ) : failed ? (
        <Note role="alert">{t.admin.commentsFailed}</Note>
      ) : (
        <AdminTable
          rows={comments ?? []}
          rowId={(row) => row.id}
          empty={comments ? t.admin.commentsEmpty : t.feedPage.commentsLoading}
          columns={[
            { id: 'when', header: t.admin.commentsWhen, cell: (row) => when(row.createdAt), muted: true },
            { id: 'author', header: t.admin.commentsAuthor, cell: (row) => row.authorName || row.userId },
            { id: 'body', header: t.admin.commentsBody, cell: (row) => <Body>{row.body}</Body> },
            { id: 'post', header: t.admin.commentsPost, cell: (row) => <Body>{row.postBody}</Body>, muted: true },
          ]}
          actions={readOnly ? undefined : (row) => [
            {
              id: 'remove',
              label: t.admin.commentsRemove,
              variant: 'danger',
              disabled: busyId === row.id,
              onClick: (item) => void remove(item),
            },
          ]}
        />
      )}
    </AdminSection>
  )
}
