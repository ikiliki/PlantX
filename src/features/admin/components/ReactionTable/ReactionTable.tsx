import { useEffect, useState } from 'react'
import { useI18n } from '../../../../i18n/I18nProvider'
import { deleteAdminReaction, fetchAdminReactionsOutcome } from '../../../../mock/liveApi'
import { useStore } from '../../../../mock/store'
import type { AdminReaction } from '../../../../mock/types'
import { LoaderShell } from '../../../../components/LoaderShell/LoaderShell'
import { AdminSection } from '../AdminSection/AdminSection'
import { AdminTable } from '../AdminTable/AdminTable'
import { Body, Note } from './ReactionTable.styles'

/**
 * The newest 🌿 on Feed posts (posts are the Activities table). Admin → Server shows it read-only (`bare`, in a
 * collapsible section); Admin → Moderation (`moderate`) can remove one, which is logged on that post.
 */
export function ReactionTable({ moderate = false, bare = false }: { moderate?: boolean; bare?: boolean }) {
  const { t, locale } = useI18n()
  const { db, plantxEnv } = useStore()
  const mock = plantxEnv === 'mock'
  const [rows, setRows] = useState<AdminReaction[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

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
  const key = (row: AdminReaction) => `${row.activityId}:${row.userId}`

  const remove = async (row: AdminReaction) => {
    setBusyId(key(row))
    const res = await deleteAdminReaction(row.activityId, row.userId)
    setBusyId(null)
    if (res.ok) setRows((current) => (current ?? []).filter((item) => key(item) !== key(row)))
  }

  const body = (
    <>
      {mock ? (
        <Note>{t.admin.reactionsMock}</Note>
      ) : failed ? (
        <Note role="alert">{t.admin.reactionsFailed}</Note>
      ) : !rows ? (
        <LoaderShell busy compact />
      ) : (
        <AdminTable
          rows={rows}
          rowId={key}
          empty={t.admin.reactionsEmpty}
          columns={[
            { id: 'when', header: t.admin.commentsWhen, cell: (row) => when(row.createdAt), muted: true },
            { id: 'by', header: t.admin.commentsAuthor, cell: (row) => row.userName || row.userId },
            { id: 'post', header: t.admin.commentsPost, cell: (row) => <Body>{row.postBody}</Body> },
            { id: 'owner', header: t.admin.serverColUser, cell: (row) => owner(row.postUserId), muted: true },
            { id: 'activity', header: t.admin.serverColId, cell: (row) => row.activityId, muted: true },
          ]}
          actions={
            moderate
              ? (row) => [
                  {
                    id: 'remove',
                    label: t.admin.reactionsRemove,
                    variant: 'danger',
                    disabled: busyId === key(row),
                    onClick: (item) => void remove(item),
                  },
                ]
              : undefined
          }
        />
      )}
    </>
  )
  const lead = moderate ? t.admin.reactionsLeadModeration : t.admin.reactionsLead
  if (bare) {
    return (
      <>
        <Note>{lead}</Note>
        {body}
      </>
    )
  }
  return (
    <AdminSection title={t.admin.reactionsTitle} lead={lead}>
      {body}
    </AdminSection>
  )
}
