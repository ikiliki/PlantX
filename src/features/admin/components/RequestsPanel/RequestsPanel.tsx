import { useEffect, useState } from 'react'
import { Badge } from '../../../../components/Badge/Badge'
import { Button } from '../../../../components/Button/Button'
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
import {
  decideMockSuggestion,
  readMockSuggestions,
  useSuggestionsVersion,
} from '../../../catalog/useCatalogSuggestions'
import { applyCatalogSuggestion } from '../../catalogMutations'
import { AdminDetailGrid, AdminTable } from '../AdminTable/AdminTable'
import { SuggestionEditorDialog } from '../CatalogSuggestions/SuggestionEditorDialog'
import { ExpandActions, HeadMeta, IdeasBar, Panel, Section, SectionHead } from './RequestsPanel.styles'

/** The admin's own new catalog entry: an empty suggestion with no row behind it. */
const freshEntry: CatalogSuggestion = {
  id: '',
  createdAt: '',
  name: '',
  scientificName: '',
  genus: '',
  commonNames: [],
  provider: '',
  hits: 0,
  status: 'open',
  origin: 'member',
  suggestedBy: [],
  note: '',
  draft: {
    category: { name: '', nameHe: '', ticker: '', photo: '' },
    subcategory: { name: '', nameHe: '', code: '', photo: '' },
    properties: [],
  },
}

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
  const suggestionsVersion = useSuggestionsVersion()
  const scripted = applications !== undefined || suggestions !== undefined
  const [remoteApps, setRemoteApps] = useState<PendingUser[]>([])
  const [remoteSuggestions, setRemoteSuggestions] = useState<CatalogSuggestion[]>([])
  const [storyApps, setStoryApps] = useState<PendingUser[]>(applications ?? [])
  const [storySuggestions, setStorySuggestions] = useState<CatalogSuggestion[]>(suggestions ?? [])
  const [loading, setLoading] = useState(!scripted && plantxEnv !== 'mock')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [editing, setEditing] = useState<CatalogSuggestion | null>(null)
  const [appsOpen, setAppsOpen] = useState(true)
  const [ideasOpen, setIdeasOpen] = useState(true)
  const [selectedApps, setSelectedApps] = useState<string[]>([])
  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([])
  const [expandedApps, setExpandedApps] = useState<string[]>([])
  const [expandedIdeas, setExpandedIdeas] = useState<string[]>([])

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
    // Mock and stories read local rows. Live loads once, and again when a suggestion is filed here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scripted, plantxEnv, suggestionsVersion])

  const apps = scripted ? storyApps : plantxEnv === 'mock' ? db.pendingUsers : remoteApps
  const ideas = scripted ? storySuggestions : plantxEnv === 'mock' ? readMockSuggestions() : remoteSuggestions
  const openApps = byNewest(apps.filter((row) => row.status === 'pending'))
  const historyApps = byNewest(apps.filter((row) => row.status === 'approved' || row.status === 'rejected'))
  const openIdeas = ideas.filter((row) => row.status === 'open').sort((a, b) => b.hits - a.hits || b.createdAt.localeCompare(a.createdAt))
  const historyIdeas = byNewest(ideas.filter((row) => row.status === 'added' || row.status === 'dismissed'))

  const appStatus = (status: PendingUser['status']) =>
    status === 'approved' ? t.admin.requestAdded : status === 'rejected' ? t.admin.requestDeclined : t.admin.statusPending

  const originLabel = (row: CatalogSuggestion) =>
    row.origin === 'member' ? t.admin.suggestedOriginMember : t.admin.suggestedOriginScan
  const personName = (id: string) => {
    const user = db.users.find((item) => item.id === id)
    return user?.nickname || user?.name || id
  }
  const categoryName = (id: string) => db.catalog?.categories.find((item) => item.id === id)?.name ?? id

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
    if (plantxEnv === 'mock') {
      decideMockSuggestion(id, 'dismissed')
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
    // An empty id is the admin's own new entry: there is no suggestion row to mark.
    if (id && scripted) {
      setStorySuggestions((rows) => rows.map((row) => (row.id === id ? { ...row, status: 'added', draft } : row)))
    } else if (id && plantxEnv === 'mock') {
      decideMockSuggestion(id, 'added', draft)
    } else if (id) {
      setRemoteSuggestions((rows) => rows.map((row) => (row.id === id ? { ...row, status: 'added', draft } : row)))
      void acceptCatalogSuggestion(id)
    }
    setEditing(null)
    return true
  }

  if (loading) return <LoaderShell busy />

  const appRows = [...openApps, ...historyApps]
  const ideaRows = [...openIdeas, ...historyIdeas]
  const when = (value: string) => value.slice(0, 16).replace('T', ' ')

  const bulkApps = async (ids: string[], mode: 'approve' | 'reject') => {
    const pending = ids.filter((id) => appRows.find((row) => row.id === id)?.status === 'pending')
    for (const id of pending) await runApp(id, mode)
    setSelectedApps([])
  }

  const bulkDismiss = (ids: string[]) => {
    ids
      .filter((id) => ideaRows.find((row) => row.id === id)?.status === 'open')
      .forEach((id) => declineIdea(id))
    setSelectedIdeas([])
  }

  return (
    <Panel>
      <Section>
        <SectionHead type="button" $open={appsOpen} aria-expanded={appsOpen} onClick={() => setAppsOpen((open) => !open)}>
          <h2>{t.admin.pendingMembers}</h2>
          <HeadMeta>
            <span>{appRows.length}</span>
          </HeadMeta>
        </SectionHead>
        {appsOpen ? (
          <AdminTable
            rows={appRows}
            rowId={(row) => row.id}
            empty={t.admin.pendingEmpty}
            selectable
            selected={selectedApps}
            onSelectedChange={setSelectedApps}
            expandable
            expandedIds={expandedApps}
            onExpandedChange={setExpandedApps}
            columns={[
              { id: 'id', header: t.admin.serverColId, cell: (row) => row.id, muted: true },
              { id: 'name', header: t.admin.serverColName, cell: (row) => row.name },
              { id: 'email', header: t.admin.serverColEmail, cell: (row) => row.email, muted: true },
              {
                id: 'status',
                header: t.admin.serverColStatus,
                cell: (row) => (
                  <Badge $tone={row.status === 'approved' ? 'lime' : row.status === 'rejected' ? 'danger' : 'warn'}>
                    {appStatus(row.status)}
                  </Badge>
                ),
              },
              { id: 'when', header: t.admin.serverColWhen, cell: (row) => when(row.createdAt), muted: true },
            ]}
            renderExpand={(row) => (
              <>
                <AdminDetailGrid
                  items={[
                    { label: t.admin.serverColEmail, value: row.email },
                    { label: t.landing.registerNote, value: row.note || '—' },
                    { label: t.admin.serverColStatus, value: appStatus(row.status) },
                    { label: t.admin.serverColWhen, value: when(row.createdAt) },
                  ]}
                />
                {row.status === 'pending' ? (
                  <ExpandActions>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={busyId === row.id}
                      onClick={() => void runApp(row.id, 'reject')}
                    >
                      {t.admin.reject}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="growth"
                      disabled={busyId === row.id}
                      onClick={() => void runApp(row.id, 'approve')}
                    >
                      {t.admin.activate}
                    </Button>
                  </ExpandActions>
                ) : null}
              </>
            )}
            bulkActions={[
              {
                id: 'reject',
                label: t.admin.reject,
                variant: 'ghost',
                onClick: (ids) => void bulkApps(ids, 'reject'),
              },
              {
                id: 'activate',
                label: t.admin.activate,
                variant: 'growth',
                onClick: (ids) => void bulkApps(ids, 'approve'),
              },
            ]}
          />
        ) : null}
      </Section>

      <Section>
        <SectionHead
          type="button"
          $open={ideasOpen}
          aria-expanded={ideasOpen}
          onClick={() => setIdeasOpen((open) => !open)}
        >
          <h2>{t.admin.suggestedCategories}</h2>
          <HeadMeta>
            <span>{ideaRows.length}</span>
          </HeadMeta>
        </SectionHead>
        {ideasOpen ? (
          <IdeasBar>
            <p>{t.admin.suggestedCategoriesLead}</p>
            <Button type="button" size="sm" variant="secondary" onClick={() => setEditing(freshEntry)}>
              ＋ {t.admin.newCatalogEntry}
            </Button>
          </IdeasBar>
        ) : null}
        {ideasOpen ? (
          <AdminTable
            rows={ideaRows}
            rowId={(row) => row.id}
            empty={t.admin.requestHistoryEmpty}
            selectable
            selected={selectedIdeas}
            onSelectedChange={setSelectedIdeas}
            expandable
            expandedIds={expandedIdeas}
            onExpandedChange={setExpandedIdeas}
            columns={[
              { id: 'id', header: t.admin.serverColId, cell: (row) => row.id, muted: true },
              { id: 'name', header: t.admin.serverColName, cell: (row) => row.name },
              {
                id: 'origin',
                header: t.admin.suggestedOrigin,
                cell: (row) => (
                  <Badge $tone={row.origin === 'member' ? 'info' : 'muted'}>{originLabel(row)}</Badge>
                ),
              },
              {
                id: 'scientific',
                header: t.addPlant.factScientific,
                cell: (row) => row.scientificName || '—',
                muted: true,
              },
              {
                id: 'status',
                header: t.admin.serverColStatus,
                cell: (row) => (
                  <Badge $tone={row.status === 'added' ? 'lime' : row.status === 'open' ? 'warn' : 'muted'}>
                    {ideaStatus(row.status)}
                  </Badge>
                ),
              },
              { id: 'when', header: t.admin.serverColWhen, cell: (row) => when(row.createdAt), muted: true },
            ]}
            renderExpand={(row) => (
              <>
                <AdminDetailGrid
                  items={[
                    { label: t.addPlant.factScientific, value: row.scientificName || '—' },
                    ...(row.draft.categoryId
                      ? [{ label: t.admin.suggestedCategory, value: t.admin.suggestedVarietyOf.replace('{category}', categoryName(row.draft.categoryId)) }]
                      : []),
                    { label: t.admin.suggestedOrigin, value: originLabel(row) },
                    {
                      label: t.admin.suggestedPeople,
                      value: row.suggestedBy.length ? row.suggestedBy.map(personName).join(', ') : '—',
                    },
                    ...(row.note ? [{ label: t.admin.suggestedNote, value: row.note }] : []),
                    {
                      label: row.provider ? t.admin.suggestedBy.replace('{provider}', row.provider) : t.admin.suggestedOrigin,
                      value: t.admin.suggestedHits.replace('{count}', String(row.hits)),
                    },
                    { label: t.admin.serverColStatus, value: ideaStatus(row.status) },
                    { label: t.admin.serverColWhen, value: when(row.createdAt) },
                  ]}
                />
                {row.status === 'open' ? (
                  <ExpandActions>
                    <Button type="button" size="sm" variant="ghost" onClick={() => declineIdea(row.id)}>
                      {t.admin.dismiss}
                    </Button>
                    <Button type="button" size="sm" variant="growth" onClick={() => setEditing(row)}>
                      {t.admin.suggestedApprove}
                    </Button>
                  </ExpandActions>
                ) : null}
              </>
            )}
            bulkActions={[
              {
                id: 'dismiss',
                label: t.admin.dismiss,
                variant: 'ghost',
                onClick: bulkDismiss,
              },
            ]}
          />
        ) : null}
      </Section>

      {editing ? (
        <SuggestionEditorDialog
          suggestion={editing}
          onClose={() => setEditing(null)}
          onConfirm={(draft) => acceptIdea(editing.id, draft)}
        />
      ) : null}
    </Panel>
  )
}
