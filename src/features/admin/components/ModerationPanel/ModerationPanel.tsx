import { useCallback, useEffect, useMemo, useState } from 'react'
import { Badge } from '../../../../components/Badge/Badge'
import { FilterChips } from '../../../../components/FilterChips/FilterChips'
import { Input } from '../../../../components/Form/Form'
import { Segmented } from '../../../../components/Segmented/Segmented'
import { useI18n } from '../../../../i18n/I18nProvider'
import {
  fetchModerationItems,
  fetchModerationLog,
  type ModerationItem,
  type ModerationState,
} from '../../../../mock/liveApi'
import { useStore } from '../../../../mock/store'
import type { ModerationEntry, ModerationTarget, Visibility } from '../../../../mock/types'
import { useServerSlices } from '../../../../mock/useServerSlices'
import { PlantEditDialog } from '../../../greenhouse/components/PlantEditDialog/PlantEditDialog'
import { AdminTable } from '../AdminTable/AdminTable'
import { ModerationDialog, type ModerationRequest } from '../ModerationDialog/ModerationDialog'
import { ScanQuotaDialog } from '../ScanQuotaDialog/ScanQuotaDialog'
import { UserEditDialog } from '../UserEditDialog/UserEditDialog'
import { Changed, Controls, Empty, Log, LogRow, Root, Section, SectionTitle } from './ModerationPanel.styles'

/**
 * Admin → Moderation (#68, #69): users, plants and activities with their state, edit, hide / show,
 * soft delete / restore, and the log. A row hidden through its parent says so ("Hidden with its grower").
 * Mock mode builds the same rows from the browser data.
 */
export function ModerationPanel() {
  const { t, locale } = useI18n()
  const { db, plantxEnv } = useStore()
  useServerSlices(['users', 'plants', 'updates'])
  const mock = plantxEnv === 'mock'
  const [type, setType] = useState<ModerationTarget>('user')
  const [state, setState] = useState<ModerationState>('all')
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<ModerationItem[] | null>(null)
  const [log, setLog] = useState<ModerationEntry[]>([])
  const [failed, setFailed] = useState(false)
  const [request, setRequest] = useState<ModerationRequest | null>(null)
  const [editUserId, setEditUserId] = useState<string | null>(null)
  const [editPlantId, setEditPlantId] = useState<string | null>(null)
  const [scansUserId, setScansUserId] = useState<string | null>(null)

  const mockItems = useMemo(() => buildMockItems(db, type), [db, type])

  const load = useCallback(async () => {
    if (mock) return
    setFailed(false)
    const [rows, entries] = await Promise.all([fetchModerationItems(type, state, query), fetchModerationLog()])
    if (rows.ok) setItems(rows.data.items)
    else setFailed(true)
    if (entries.ok) setLog(entries.data.entries)
  }, [mock, type, state, query])

  useEffect(() => {
    setItems(null)
    const id = window.setTimeout(() => void load(), query ? 250 : 0)
    return () => window.clearTimeout(id)
  }, [load, query])

  const shown = mock
    ? mockItems.filter(
        (row) =>
          (state === 'all' || (state === 'moderated' ? row.effective !== 'visible' : row.effective === state)) &&
          (!query || `${row.label} ${row.detail}`.toLowerCase().includes(query.toLowerCase())),
      )
    : items

  const user = (id: string | null) => db.users.find((item) => item.id === id)
  const plant = db.plants.find((item) => item.id === editPlantId)
  const fmt = (iso?: string) =>
    iso ? new Date(iso).toLocaleString(locale === 'he' ? 'he-IL' : 'en-GB', { dateStyle: 'short', timeStyle: 'short' }) : ''

  const stateBadge = (row: ModerationItem) => {
    if (row.visibility === 'deleted') return <Badge $tone="danger">{t.moderation.state.deleted}</Badge>
    if (row.visibility === 'hidden') return <Badge $tone="warn">{t.moderation.state.hidden}</Badge>
    if (row.effective !== 'visible') return <Badge $tone="muted">{t.moderation.state.byParent}</Badge>
    return <Badge $tone="forest">{t.moderation.state.visible}</Badge>
  }

  return (
    <Root>
      <Controls>
        <Segmented
          ariaLabel={t.moderation.typeLabel}
          value={type}
          onChange={(next) => setType(next)}
          options={[
            { id: 'user', label: t.moderation.types.user },
            { id: 'plant', label: t.moderation.types.plant },
            { id: 'activity', label: t.moderation.types.activity },
          ]}
        />
        <FilterChips
          label={t.moderation.stateLabel}
          value={state}
          onChange={setState}
          options={[
            { id: 'all', label: t.moderation.filters.all },
            { id: 'moderated', label: t.moderation.filters.moderated },
            { id: 'hidden', label: t.moderation.filters.hidden },
            { id: 'deleted', label: t.moderation.filters.deleted },
          ]}
        />
        <Input
          type="search"
          value={query}
          placeholder={t.moderation.search}
          aria-label={t.moderation.search}
          onChange={(event) => setQuery(event.target.value)}
        />
      </Controls>

      {failed ? <Empty role="alert">{t.moderation.loadFailed}</Empty> : null}
      {shown === null ? (
        <Empty>{t.common.loading}</Empty>
      ) : (
        <AdminTable
          rows={shown}
          rowId={(row) => row.id}
          empty={t.moderation.empty}
          columns={[
            { id: 'label', header: t.moderation.colName, cell: (row) => row.label },
            { id: 'detail', header: t.moderation.colDetail, cell: (row) => row.detail || '—', muted: true },
            { id: 'state', header: t.moderation.colState, cell: stateBadge },
            {
              id: 'changed',
              header: t.moderation.colChanged,
              cell: (row) =>
                row.changedAt ? (
                  <Changed>
                    {row.changedBy ?? '—'} · {fmt(row.changedAt)}
                    {row.reason ? <em>{row.reason}</em> : null}
                  </Changed>
                ) : (
                  '—'
                ),
              muted: true,
            },
          ]}
          actions={(row) => {
            const target = { type: row.type, id: row.id, label: row.label.slice(0, 60) }
            const isAdmin = row.type === 'user' && user(row.id)?.role === 'admin'
            const list = []
            if (row.type === 'user') {
              list.push({ id: 'edit', label: t.moderation.edit, variant: 'ghost' as const, onClick: () => setEditUserId(row.id) })
              list.push({ id: 'scans', label: t.moderation.scans, variant: 'ghost' as const, onClick: () => setScansUserId(row.id) })
            }
            if (row.type === 'plant') {
              list.push({
                id: 'edit',
                label: t.moderation.edit,
                variant: 'ghost' as const,
                disabled: !db.plants.some((item) => item.id === row.id),
                onClick: () => setEditPlantId(row.id),
              })
            }
            if (isAdmin) return list
            if (row.visibility === 'deleted') {
              list.push({ id: 'restore', label: t.moderation.action.restore, variant: 'growth' as const, onClick: () => setRequest({ ...target, action: 'restore' }) })
              return list
            }
            list.push(
              row.visibility === 'hidden'
                ? { id: 'show', label: t.moderation.action.show, variant: 'growth' as const, onClick: () => setRequest({ ...target, action: 'show' }) }
                : { id: 'hide', label: t.moderation.action.hide, variant: 'secondary' as const, onClick: () => setRequest({ ...target, action: 'hide' }) },
            )
            list.push({ id: 'delete', label: t.moderation.action.delete, variant: 'danger' as const, onClick: () => setRequest({ ...target, action: 'delete' }) })
            return list
          }}
        />
      )}

      {!mock ? (
        <Section>
          <SectionTitle>{t.moderation.log}</SectionTitle>
          {log.length === 0 ? (
            <Empty>{t.moderation.logEmpty}</Empty>
          ) : (
            <Log>
              {log.slice(0, 30).map((entry) => (
                <LogRow key={entry.id}>
                  <strong>
                    {t.moderation.logLine[entry.action]
                      .replace('{actor}', entry.actorName ?? '—')
                      .replace('{target}', entry.targetLabel || `${entry.targetType} ${entry.targetId}`)}
                  </strong>
                  <span>
                    {fmt(entry.createdAt)}
                    {entry.reason ? ` · ${entry.reason}` : ''}
                    {entry.cascade.plants || entry.cascade.activities
                      ? ` · ${t.moderation.countPlants.replace('{n}', String(entry.cascade.plants ?? 0))}, ${t.moderation.countActivities.replace('{n}', String(entry.cascade.activities ?? 0))}`
                      : ''}
                  </span>
                </LogRow>
              ))}
            </Log>
          )}
        </Section>
      ) : null}

      {request ? <ModerationDialog request={request} onClose={() => setRequest(null)} onDone={() => void load()} /> : null}
      {editUserId && user(editUserId) ? (
        <UserEditDialog
          user={user(editUserId)!}
          onClose={() => {
            setEditUserId(null)
            void load()
          }}
        />
      ) : null}
      {plant ? (
        <PlantEditDialog
          plant={plant}
          onClose={() => {
            setEditPlantId(null)
            void load()
          }}
        />
      ) : null}
      {scansUserId && user(scansUserId) ? (
        <ScanQuotaDialog user={user(scansUserId)!} onClose={() => setScansUserId(null)} />
      ) : null}
    </Root>
  )
}

/** Mock mode: the same rows from the browser data (no server, so no log). */
function buildMockItems(db: ReturnType<typeof useStore>['db'], type: ModerationTarget): ModerationItem[] {
  const state = (row: { visibility?: Visibility }): Visibility => row.visibility ?? 'visible'
  const name = (id: string) => {
    const user = db.users.find((item) => item.id === id)
    return user?.nickname || user?.name || ''
  }
  const userState = (id: string) => state(db.users.find((item) => item.id === id) ?? {})
  const worst = (a: Visibility, b: Visibility): Visibility =>
    a === 'deleted' || b === 'deleted' ? 'deleted' : a === 'hidden' || b === 'hidden' ? 'hidden' : 'visible'
  if (type === 'user') {
    return db.users
      .filter((user) => user.role !== 'guest')
      .map((user) => ({ type, id: user.id, label: user.nickname || user.name, detail: user.email ?? '', ownerId: user.id, visibility: state(user), effective: state(user) }))
  }
  if (type === 'plant') {
    return db.plants.map((plant) => ({
      type,
      id: plant.id,
      label: plant.title,
      detail: name(plant.ownerId),
      ownerId: plant.ownerId,
      visibility: state(plant),
      effective: worst(state(plant), userState(plant.ownerId)),
    }))
  }
  return (db.updates ?? []).map((item) => {
    const plant = db.plants.find((row) => row.id === item.plantId)
    const own = state(item as { visibility?: Visibility })
    return {
      type,
      id: item.id,
      label: item.body,
      detail: [name(item.userId ?? ''), plant?.title].filter(Boolean).join(' · '),
      ownerId: item.userId ?? '',
      visibility: own,
      effective: worst(worst(own, userState(item.userId ?? '')), plant ? worst(state(plant), userState(plant.ownerId)) : 'visible'),
    }
  })
}
