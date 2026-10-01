import { useEffect, useState } from 'react'
import { Badge } from '../../../../components/Badge/Badge'
import { LoaderShell } from '../../../../components/LoaderShell/LoaderShell'
import { useI18n } from '../../../../i18n/I18nProvider'
import {
  acceptCatalogSuggestion,
  dismissCatalogSuggestion,
  fetchCatalogSuggestions,
  fetchPendingUsers,
} from '../../../../mock/liveApi'
import { useStore } from '../../../../mock/store'
import type { CatalogSuggestion, CatalogSuggestionDraft, PendingUser } from '../../../../mock/types'
import { applyCatalogSuggestion } from '../../catalogMutations'
import { AdminTable } from '../AdminTable/AdminTable'
import { CatalogSuggestions } from '../CatalogSuggestions/CatalogSuggestions'
import { SuggestionEditorDialog } from '../CatalogSuggestions/SuggestionEditorDialog'
import { Block, HistoryTitle, Stack, Title } from './RequestsPanel.styles'

function byNewest<T extends { createdAt: string }>(rows: T[]) {
  return rows.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** Pending applications and catalog suggestions, plus what was added or declined. */
export function RequestsPanel({
  applications,
  suggestions,
}: {
  /** Stories pass rows and skip the server. */
  applications?: PendingUser[]
  suggestions?: CatalogSuggestion[]
}) {
  const { t } = useI18n()
  const { db, plantxEnv, approvePendingUser, rejectPendingUser, commitCatalog } = useStore()
  const scripted = applications !== undefined || suggestions !== undefined
  const [remoteApps, setRemoteApps] = useState<PendingUser[]>([])
  const [remoteSuggestions, setRemoteSuggestions] = useState<CatalogSuggestion[]>([])
  const [storyApps, setStoryApps] = useState<PendingUser[]>(applications ?? [])
  const [storySuggestions, setStorySuggestions] = useState<CatalogSuggestion[]>(suggestions ?? [])
  const [loading, setLoading] = useState(!scripted && plantxEnv !== 'mock')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [editing, setEditing] = useState<CatalogSuggestion | null>(null)

  const reload = () => {
    if (scripted || plantxEnv === 'mock') return Promise.resolve()
    return Promise.all([fetchPendingUsers('all'), fetchCatalogSuggestions('all')]).then(([apps, ideas]) => {
      setRemoteApps(apps?.pending ?? [])
      setRemoteSuggestions(ideas ?? [])
    })
  }

  useEffect(() => {
    if (scripted || plantxEnv === 'mock') return
    let cancel = false
    setLoading(true)
    void reload().finally(() => {
      if (!cancel) setLoading(false)
    })
    return () => {
      cancel = true
    }
    // Mock and stories read local rows. Live loads once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scripted, plantxEnv])

  const apps = scripted ? storyApps : plantxEnv === 'mock' ? db.pendingUsers : remoteApps
  const ideas = scripted ? storySuggestions : remoteSuggestions
  const openApps = byNewest(apps.filter((row) => row.status === 'pending'))
  const historyApps = byNewest(apps.filter((row) => row.status === 'approved' || row.status === 'rejected'))
  const openIdeas = ideas.filter((row) => row.status === 'open').sort((a, b) => b.hits - a.hits || b.createdAt.localeCompare(a.createdAt))
  const historyIdeas = byNewest(ideas.filter((row) => row.status === 'added' || row.status === 'dismissed'))

  const appStatus = (status: PendingUser['status']) =>
    status === 'approved' ? t.admin.requestAdded : status === 'rejected' ? t.admin.requestDeclined : t.admin.statusPending

  const ideaStatus = (status: CatalogSuggestion['status']) =>
    status === 'added' ? t.admin.requestAdded : status === 'dismissed' ? t.admin.requestDeclined : t.admin.statusPending

  const runApp = async (id: string, mode: 'approve' | 'reject') => {
    if (scripted) {
      setStoryApps((rows) =>
        rows.map((row) =>
          row.id === id
            ? {
                ...row,
                status: mode === 'approve' ? 'approved' : 'rejected',
                approvedAt: mode === 'approve' ? new Date().toISOString() : row.approvedAt,
                rejectedAt: mode === 'reject' ? new Date().toISOString() : row.rejectedAt,
              }
            : row,
        ),
      )
      return
    }
    setBusyId(id)
    const ok = mode === 'approve' ? await approvePendingUser(id) : await rejectPendingUser(id)
    if (ok) await reload()
    setBusyId(null)
  }

  const declineIdea = (id: string) => {
    if (scripted) {
      setStorySuggestions((rows) => rows.map((row) => (row.id === id ? { ...row, status: 'dismissed' } : row)))
      return
    }
    setRemoteSuggestions((rows) => rows.map((row) => (row.id === id ? { ...row, status: 'dismissed' } : row)))
    void dismissCatalogSuggestion(id)
  }

  const acceptIdea = (id: string, draft: CatalogSuggestionDraft) => {
    let saved = false
    commitCatalog(({ catalog, species }) => {
      const next = applyCatalogSuggestion(catalog, species, draft)
      if (!next) return { catalog, species }
      saved = true
      return next
    })
    if (!saved) return false
    if (scripted) {
      setStorySuggestions((rows) => rows.map((row) => (row.id === id ? { ...row, status: 'added', draft } : row)))
    } else {
      setRemoteSuggestions((rows) => rows.map((row) => (row.id === id ? { ...row, status: 'added', draft } : row)))
      void acceptCatalogSuggestion(id)
    }
    setEditing(null)
    return true
  }

  if (loading) return <LoaderShell busy />

  return (
    <Stack>
      <Block>
        <Title>{t.admin.pendingMembers}</Title>
        <AdminTable
          rows={openApps}
          rowId={(row) => row.id}
          empty={t.admin.pendingEmpty}
          columns={[
            { id: 'name', header: t.admin.serverColName, cell: (row) => row.name },
            { id: 'email', header: t.admin.serverColEmail, cell: (row) => row.email, muted: true },
            { id: 'note', header: t.landing.registerNote, cell: (row) => row.note ?? '—', muted: true },
            { id: 'when', header: t.admin.serverColWhen, cell: (row) => row.createdAt.slice(0, 10), muted: true },
          ]}
          actions={(row) => [
            {
              id: 'reject',
              label: t.admin.reject,
              variant: 'ghost',
              disabled: busyId === row.id,
              onClick: () => void runApp(row.id, 'reject'),
            },
            {
              id: 'activate',
              label: t.admin.activate,
              variant: 'growth',
              disabled: busyId === row.id,
              onClick: () => void runApp(row.id, 'approve'),
            },
          ]}
        />
        <HistoryTitle>{t.admin.requestHistory}</HistoryTitle>
        <AdminTable
          rows={historyApps}
          rowId={(row) => row.id}
          empty={t.admin.requestHistoryEmpty}
          columns={[
            { id: 'name', header: t.admin.serverColName, cell: (row) => row.name },
            { id: 'email', header: t.admin.serverColEmail, cell: (row) => row.email, muted: true },
            {
              id: 'status',
              header: t.admin.serverColStatus,
              cell: (row) => (
                <Badge $tone={row.status === 'approved' ? 'lime' : 'danger'}>{appStatus(row.status)}</Badge>
              ),
            },
            { id: 'when', header: t.admin.serverColWhen, cell: (row) => row.createdAt.slice(0, 10), muted: true },
          ]}
        />
      </Block>

      <Block>
        <CatalogSuggestions items={openIdeas} showEmpty onAdd={setEditing} onDismiss={declineIdea} />
        <HistoryTitle>{t.admin.requestHistory}</HistoryTitle>
        <AdminTable
          rows={historyIdeas}
          rowId={(row) => row.id}
          empty={t.admin.requestHistoryEmpty}
          columns={[
            { id: 'name', header: t.admin.serverColName, cell: (row) => row.name },
            { id: 'scientific', header: t.addPlant.factScientific, cell: (row) => row.scientificName || '—', muted: true },
            {
              id: 'status',
              header: t.admin.serverColStatus,
              cell: (row) => (
                <Badge $tone={row.status === 'added' ? 'lime' : 'muted'}>{ideaStatus(row.status)}</Badge>
              ),
            },
            { id: 'when', header: t.admin.serverColWhen, cell: (row) => row.createdAt.slice(0, 10), muted: true },
          ]}
        />
      </Block>

      {editing ? (
        <SuggestionEditorDialog
          suggestion={editing}
          onClose={() => setEditing(null)}
          onConfirm={(draft) => acceptIdea(editing.id, draft)}
        />
      ) : null}
    </Stack>
  )
}
