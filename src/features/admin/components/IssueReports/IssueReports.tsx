import { useEffect, useState } from 'react'
import { Badge } from '../../../../components/Badge/Badge'
import { LoaderShell } from '../../../../components/LoaderShell/LoaderShell'
import { useI18n } from '../../../../i18n/I18nProvider'
import { formatApiFailure, type ApiFailure } from '../../../../lib/apiFailure'
import { setLocalIssueStatus, subscribeIssues } from '../../../../lib/issueInbox'
import type { IssueReport } from '../../../../lib/issueReport'
import { fetchIssuesOutcome, setIssueStatus } from '../../../../mock/liveApi'
import { useStore } from '../../../../mock/store'
import { formatWhen } from '../../identifyLabels'
import { AdminDetailGrid, AdminTable } from '../AdminTable/AdminTable'
import { ApiDown } from '../ApiDown/ApiDown'
import { Block, Head, Lead, NoteCell, Section, StackText } from './IssueReports.styles'

function ReportDetail({ row }: { row: IssueReport }) {
  const { t } = useI18n()
  const context = row.context
  return (
    <Block>
      {row.note ? <p>{row.note}</p> : null}
      <AdminDetailGrid
        items={[
          { label: t.admin.issuesMessage, value: context.message || '—' },
          {
            label: t.common.status,
            value: context.kind === 'http' && context.status ? String(context.status) : '—',
          },
          { label: t.admin.issuesPage, value: context.page || '—' },
          { label: t.admin.issuesRequest, value: [context.method, context.path].filter(Boolean).join(' ') || '—' },
          { label: t.admin.issuesReferrer, value: context.referrer || '—' },
          { label: t.admin.issuesAgent, value: context.userAgent || '—' },
          { label: t.admin.issuesViewport, value: `${context.viewport} · ${context.screen}` },
          { label: t.admin.issuesTimezone, value: context.timezone || '—' },
          { label: t.admin.issuesNetwork, value: context.network || '—' },
          { label: t.admin.issuesOnline, value: context.online ? t.admin.issuesOnline : t.admin.issuesOffline },
        ]}
      />
      {context.stack ? (
        <div>
          <strong>{t.admin.issuesStack}</strong>
          <StackText dir="ltr">{context.stack}</StackText>
        </div>
      ) : null}
      {context.response ? (
        <div>
          <strong>{t.admin.issuesResponse}</strong>
          <StackText dir="ltr">{context.response}</StackText>
        </div>
      ) : null}
    </Block>
  )
}

export function IssueReports({
  seed,
  initialOpen = false,
}: {
  /** Storybook rows. The server page loads its own. */
  seed?: IssueReport[]
  initialOpen?: boolean
}) {
  const story = seed != null
  const { plantxEnv } = useStore()
  const { t, locale } = useI18n()
  const mock = !story && plantxEnv === 'mock'
  const [open, setOpen] = useState(initialOpen || story)
  const [rows, setRows] = useState<IssueReport[] | null>(story ? seed : null)
  const [failure, setFailure] = useState<ApiFailure | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string[]>([])

  useEffect(() => {
    if (!mock) return
    return subscribeIssues((next) => setRows(next.slice()))
  }, [mock])

  useEffect(() => {
    if (story || mock || !open || rows || failure) return
    let cancel = false
    void fetchIssuesOutcome().then((outcome) => {
      if (cancel) return
      if (outcome.ok) {
        setRows(outcome.data.issues)
        setFailure(null)
      } else {
        setFailure(outcome.failure)
      }
    })
    return () => {
      cancel = true
    }
  }, [story, mock, open, rows, failure])

  const resolve = async (id: string, status: 'resolved' | 'dismissed') => {
    if (story) {
      setRows((current) =>
        (current ?? []).map((row) => (row.id === id && row.status === 'open' ? { ...row, status } : row)),
      )
      return
    }
    if (mock) {
      setLocalIssueStatus(id, status)
      return
    }
    setBusyId(id)
    const outcome = await setIssueStatus(id, status)
    setBusyId(null)
    if (outcome.ok) {
      setRows((current) =>
        (current ?? []).map((row) => (row.id === id && row.status === 'open' ? { ...row, status } : row)),
      )
    }
  }

  const list = rows ?? []
  const openCount = list.filter((row) => row.status === 'open').length

  return (
    <Section>
      <Head
        type="button"
        $open={open}
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value)
          if (!open && failure) {
            setFailure(null)
            setRows(null)
          }
        }}
      >
        <h2>{t.admin.issues}</h2>
        <span>{t.admin.issuesOpenCount.replace('{count}', String(rows ? openCount : '—'))}</span>
      </Head>
      {open ? (
        <>
          <Lead>{t.admin.issuesLead}</Lead>
          {!story && !mock && rows == null && !failure ? <LoaderShell busy /> : null}
          {failure ? <ApiDown detail={formatApiFailure(failure, t.admin)} /> : null}
          {rows && !failure ? (
            <AdminTable
              rows={list}
              rowId={(row) => row.id}
              empty={t.admin.issuesEmpty}
              expandable
              expandedIds={expanded}
              onExpandedChange={setExpanded}
              renderExpand={(row) => <ReportDetail row={row} />}
              columns={[
                {
                  id: 'when',
                  header: t.admin.serverColWhen,
                  cell: (row) => formatWhen(row.createdAt, locale),
                  muted: true,
                },
                {
                  id: 'who',
                  header: t.admin.issuesWho,
                  cell: (row) => row.userName || t.admin.issuesGuest,
                },
                {
                  id: 'note',
                  header: t.admin.issuesNote,
                  cell: (row) => <NoteCell>{row.note || '—'}</NoteCell>,
                },
                {
                  id: 'kind',
                  header: t.admin.issuesKind,
                  cell: (row) => (row.context.kind === 'client' ? t.admin.issuesClient : t.admin.issuesHttp),
                  muted: true,
                },
                {
                  id: 'status',
                  header: t.admin.serverColStatus,
                  cell: (row) => (
                    <Badge $tone={row.status === 'open' ? 'warn' : 'muted'}>
                      {row.status === 'open'
                        ? t.admin.issuesOpen
                        : row.status === 'resolved'
                          ? t.admin.issuesResolved
                          : t.admin.issuesDismissed}
                    </Badge>
                  ),
                },
              ]}
              actions={(row) =>
                row.status === 'open'
                  ? [
                      {
                        id: 'resolve',
                        label: t.admin.resolve,
                        variant: 'growth',
                        disabled: busyId === row.id,
                        onClick: () => void resolve(row.id, 'resolved'),
                      },
                      {
                        id: 'dismiss',
                        label: t.admin.dismiss,
                        variant: 'ghost',
                        disabled: busyId === row.id,
                        onClick: () => void resolve(row.id, 'dismissed'),
                      },
                    ]
                  : []
              }
            />
          ) : null}
        </>
      ) : null}
    </Section>
  )
}
