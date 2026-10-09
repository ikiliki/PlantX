import { useEffect, useState } from 'react'
import { useI18n } from '../../../../i18n/I18nProvider'
import { fetchAdminReactionsOutcome } from '../../../../mock/liveApi'
import { useStore } from '../../../../mock/store'
import type { AdminReaction } from '../../../../mock/types'
import { AdminSection } from '../AdminSection/AdminSection'
import { AdminTable } from '../AdminTable/AdminTable'
import { Body, Note } from './ReactionTable.styles'

/** Admin → Server → Reactions: the newest 🌿 on Feed posts, read-only (posts are the Activities table). */
export function ReactionTable() {
  const { t, locale } = useI18n()
  const { db, plantxEnv } = useStore()
  const mock = plantxEnv === 'mock'
  const [rows, setRows] = useState<AdminReaction[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (mock) return
    let cancelled = false
    void fetchAdminReactionsOutcome().then((res) => {
      if (cancelled) return
      if (res.ok) setRows(res.data.reactions)
      else setFailed(true)
    })
    return () => {
      cancelled = true
    }
  }, [mock])

  const when = (iso: string) =>
    new Date(iso).toLocaleString(locale === 'he' ? 'he-IL' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  const owner = (id: string) => db.users.find((user) => user.id === id)?.name ?? id

  return (
    <AdminSection title={t.admin.reactionsTitle} lead={t.admin.reactionsLead}>
      {mock ? (
        <Note>{t.admin.reactionsMock}</Note>
      ) : failed ? (
        <Note role="alert">{t.admin.reactionsFailed}</Note>
      ) : (
        <AdminTable
          rows={rows ?? []}
          rowId={(row) => `${row.activityId}:${row.userId}`}
          empty={rows ? t.admin.reactionsEmpty : t.feedPage.commentsLoading}
          columns={[
            { id: 'when', header: t.admin.commentsWhen, cell: (row) => when(row.createdAt), muted: true },
            { id: 'by', header: t.admin.commentsAuthor, cell: (row) => row.userName || row.userId },
            { id: 'post', header: t.admin.commentsPost, cell: (row) => <Body>{row.postBody}</Body> },
            { id: 'owner', header: t.admin.serverColUser, cell: (row) => owner(row.postUserId), muted: true },
            { id: 'activity', header: t.admin.serverColId, cell: (row) => row.activityId, muted: true },
          ]}
        />
      )}
    </AdminSection>
  )
}
