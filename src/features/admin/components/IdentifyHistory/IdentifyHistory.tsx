import { useState } from 'react'
import { Badge } from '../../../../components/Badge/Badge'
import { LoaderShell } from '../../../../components/LoaderShell/LoaderShell'
import { Button } from '../../../../components/Button/Button'
import { Segmented } from '../../../../components/Segmented/Segmented'
import { useI18n } from '../../../../i18n/I18nProvider'
import type {
  IdentifyFieldCheck,
  IdentifyFieldId,
  IdentifyMode,
  IdentifyRequestRecord,
} from '../../../../mock/types'
import {
  formatWhen,
  modeLabelKey,
  modeTone,
  providerNameKey,
  requestStatusKey,
  requestStatusTone,
  sourceLabelKey,
  targetLabelKey,
} from '../../identifyLabels'
import { AdminSection } from '../AdminSection/AdminSection'
import { AdminTable, type AdminTableColumn } from '../AdminTable/AdminTable'
import { IdentifyResult } from '../IdentifyResult/IdentifyResult'
import { Answer, Duration, FieldChip, FieldChips, Thumb, Toolbar } from './IdentifyHistory.styles'

export type IdentifyHistoryFilter = 'all' | IdentifyMode

const filters: IdentifyHistoryFilter[] = ['all', 'mock', 'live']

const fieldOrder: IdentifyFieldId[] = ['category', 'subcategory', 'quality', 'size', 'stage']

const fieldLabelKey = {
  category: 'category',
  subcategory: 'subcategory',
  quality: 'health',
  size: 'size',
  stage: 'stage',
} as const satisfies Record<IdentifyFieldId, string>

const fieldStateKey = {
  kept: 'apisFieldKept',
  changed: 'apisFieldChanged',
  manual: 'apisFieldManual',
} as const satisfies Record<IdentifyFieldCheck, string>

export function IdentifyHistory({
  records,
  filter,
  onFilterChange,
  onRefresh,
  loading,
}: {
  records: IdentifyRequestRecord[]
  filter: IdentifyHistoryFilter
  onFilterChange: (filter: IdentifyHistoryFilter) => void
  onRefresh?: () => void
  loading?: boolean
}) {
  const { t, locale } = useI18n()
  const [expanded, setExpanded] = useState<string[]>([])

  const columns: AdminTableColumn<IdentifyRequestRecord>[] = [
    {
      id: 'thumb',
      header: t.admin.apisPhoto,
      cell: (row) => <Thumb>{row.thumb ? <img src={row.thumb} alt="" /> : null}</Thumb>,
    },
    { id: 'when', header: t.admin.apisHistoryWhen, cell: (row) => formatWhen(row.createdAt, locale) },
    { id: 'user', header: t.admin.apisHistoryUser, cell: (row) => row.userName ?? row.userId },
    {
      id: 'source',
      header: t.admin.apisHistorySource,
      cell: (row) => t.admin[sourceLabelKey[row.source]],
      muted: true,
    },
    {
      id: 'mode',
      header: t.admin.apisMode,
      cell: (row) => <Badge $tone={modeTone(row.mode)}>{t.admin[modeLabelKey[row.mode]]}</Badge>,
    },
    { id: 'target', header: t.admin.apisTarget, cell: (row) => t.admin[targetLabelKey[row.target]] },
    {
      id: 'answer',
      header: t.admin.apisAnsweredBy,
      cell: (row) =>
        row.diagnosis ? (
          <Answer>
            <span>{row.diagnosis.label || t.admin.apisScenarioNotPlant}</span>
            <small>
              {row.diagnosis.provider in providerNameKey
                ? t.admin[providerNameKey[row.diagnosis.provider]]
                : '—'}
            </small>
          </Answer>
        ) : (
          '—'
        ),
    },
    {
      id: 'plant',
      header: t.admin.apisPlant,
      cell: (row) => {
        if (row.source !== 'addPlant') return '—'
        if (!row.plantId) return <Badge $tone="warn">{t.admin.apisNotAdded}</Badge>
        return (
          <Answer>
            <span>{row.plantId}</span>
            {row.photoIndex != null && (
              <small>{t.admin.apisPhotoN.replace('{n}', String(row.photoIndex + 1))}</small>
            )}
          </Answer>
        )
      },
    },
    {
      id: 'fields',
      header: t.admin.apisFields,
      cell: (row) => {
        if (!row.fields) return '—'
        const entries = fieldOrder.filter((field) => row.fields?.[field])
        if (entries.length === 0) return '—'
        return (
          <FieldChips>
            {entries.map((field) => {
              const state = row.fields![field]!
              return (
                <FieldChip key={field} $state={state}>
                  {t.admin[fieldLabelKey[field]]}
                  <small>{t.admin[fieldStateKey[state]]}</small>
                </FieldChip>
              )
            })}
          </FieldChips>
        )
      },
    },
    {
      id: 'status',
      header: t.admin.apisStatus,
      cell: (row) => (
        <Badge $tone={requestStatusTone(row.status)}>{t.admin[requestStatusKey[row.status]]}</Badge>
      ),
    },
    {
      id: 'duration',
      header: t.admin.apisDuration,
      cell: (row) => <Duration>{row.durationMs} ms</Duration>,
      muted: true,
    },
  ]

  return (
    <AdminSection title={t.admin.apisHistory} lead={t.admin.apisHistoryLead}>
      <Toolbar>
        <Segmented
          ariaLabel={t.admin.apisHistory}
          value={filter}
          onChange={onFilterChange}
          options={filters.map((id) => ({
            id,
            label: id === 'all' ? t.admin.apisHistoryAll : t.admin[modeLabelKey[id]],
          }))}
        />
        {onRefresh && (
          <Button size="sm" variant="secondary" disabled={loading} onClick={onRefresh}>
            {t.admin.apisRefresh}
          </Button>
        )}
      </Toolbar>
      {loading && records.length === 0 ? (
        <LoaderShell />
      ) : (
        <AdminTable
          rows={records}
          rowId={(row) => row.id}
          columns={columns}
          empty={t.admin.apisHistoryEmpty}
          expandable
          expandedIds={expanded}
          onExpandedChange={setExpanded}
          renderExpand={(row) => <IdentifyResult record={row} />}
          embedded
        />
      )}
    </AdminSection>
  )
}
