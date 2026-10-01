import { useCallback, useEffect, useRef, useState } from 'react'
import { AdminPage } from '../../features/admin/components/AdminPage/AdminPage'
import { ApiDown } from '../../features/admin/components/ApiDown/ApiDown'
import { ApisPanel } from '../../features/admin/components/ApisPanel/ApisPanel'
import {
  IdentifyHistory,
  type IdentifyHistoryFilter,
} from '../../features/admin/components/IdentifyHistory/IdentifyHistory'
import { IdentifyPlayground } from '../../features/admin/components/IdentifyPlayground/IdentifyPlayground'
import { useI18n } from '../../i18n/I18nProvider'
import { formatApiFailure, type ApiFailure } from '../../lib/apiFailure'
import {
  fetchCatalogSuggestions,
  fetchIdentifyHistoryOutcome,
  fetchIdentifyProvidersOutcome,
  postIdentifyTest,
  setIdentifyProviderSettings,
} from '../../mock/liveApi'
import { useStore } from '../../mock/store'
import { useSectionFetch } from '../../mock/useServerSlices'
import type {
  IdentifyMode,
  CatalogSuggestion,
  IdentifyProviderId,
  IdentifyProviderSettings,
  IdentifyProviderStatus,
  IdentifyRequestRecord,
  IdentifyTestRequest,
} from '../../mock/types'
import { Stack } from './ApisPage.styles'

const HISTORY_LIMIT = 50

export function ApisPage() {
  const { t } = useI18n()
  const { currentUser } = useStore()
  const catalogLoading = useSectionFetch(true, ['catalog'])
  const [suggestions, setSuggestions] = useState<CatalogSuggestion[]>([])
  const [providers, setProviders] = useState<IdentifyProviderStatus[]>([])
  const [providersError, setProvidersError] = useState<ApiFailure | null>(null)
  const [saving, setSaving] = useState<ReadonlySet<IdentifyProviderId>>(new Set())
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<IdentifyHistoryFilter>('all')
  const [history, setHistory] = useState<IdentifyRequestRecord[]>([])
  const [historyError, setHistoryError] = useState<ApiFailure | null>(null)
  const [historyLoading, setHistoryLoading] = useState(true)
  const historyRequest = useRef(0)
  const [mode, setMode] = useState<IdentifyMode>('mock')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<IdentifyRequestRecord | null>(null)
  const [error, setError] = useState<string>()

  const loadProviders = useCallback(async () => {
    setLoading(true)
    const res = await fetchIdentifyProvidersOutcome()
    if (res.ok) {
      setProvidersError(null)
      setProviders(res.data.providers)
    } else {
      setProvidersError(res.failure)
      setProviders([])
    }
    setLoading(false)
  }, [])

  const patchProvider = (id: IdentifyProviderId, patch: Partial<IdentifyProviderStatus>) =>
    setProviders((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)))

  const saveSettings = async (id: IdentifyProviderId, patch: Partial<IdentifyProviderSettings>) => {
    if (saving.has(id)) return
    const previous = providers.find((row) => row.id === id)
    setSaving((ids) => new Set(ids).add(id))
    setProviders((rows) =>
      rows.map((row) =>
        row.id === id
          ? { ...row, ...patch, match: patch.match ? { ...row.match, ...patch.match } : row.match }
          : row,
      ),
    )
    const updated = await setIdentifyProviderSettings(id, patch)
    if (updated) patchProvider(id, updated)
    else if (previous) patchProvider(id, previous)
    setSaving((ids) => {
      const next = new Set(ids)
      next.delete(id)
      return next
    })
  }

  const loadHistory = useCallback(async () => {
    const id = ++historyRequest.current
    setHistoryLoading(true)
    const res = await fetchIdentifyHistoryOutcome({
      mode: filter === 'all' ? undefined : filter,
      limit: HISTORY_LIMIT,
    })
    if (id !== historyRequest.current) return
    if (res.ok) {
      setHistoryError(null)
      setHistory(res.data.requests)
    } else {
      setHistoryError(res.failure)
      setHistory([])
    }
    setHistoryLoading(false)
  }, [filter])

  useEffect(() => {
    void loadProviders()
  }, [loadProviders])

  useEffect(() => {
    void fetchCatalogSuggestions('all').then((rows) => {
      if (rows) setSuggestions(rows)
    })
  }, [])

  useEffect(() => {
    void loadHistory()
  }, [loadHistory])

  const run = async (request: IdentifyTestRequest) => {
    setRunning(true)
    setError(undefined)
    const started = performance.now()
    const res = await postIdentifyTest(request)
    const record: IdentifyRequestRecord = res.record ?? {
      id: `local-${Date.now()}`,
      createdAt: new Date().toISOString(),
      userId: currentUser?.id ?? '',
      userName: currentUser?.name,
      source: 'playground',
      mode: request.mode,
      target: request.target,
      scenario: request.scenario,
      status: res.ok ? 'ok' : 'unavailable',
      thumb: request.thumb,
      durationMs: Math.round(performance.now() - started),
      diagnosis: res.ok ? res.diagnosis : undefined,
      tried: res.ok ? res.diagnosis.tried : res.tried,
    }
    setResult(record)
    setError(res.ok ? undefined : res.error)
    setRunning(false)
    if (res.record && (filter === 'all' || filter === record.mode)) {
      setHistory((rows) => [record, ...rows.filter((row) => row.id !== record.id)].slice(0, HISTORY_LIMIT))
    }
    if (request.mode === 'live') void loadProviders()
  }

  return (
    <AdminPage tab="apis" title={t.admin.apis} lead={t.admin.apisLead}>
      <Stack>
        {providersError ? (
          <ApiDown detail={formatApiFailure(providersError, t.admin)} />
        ) : (
          <ApisPanel
            providers={providers}
            suggestions={suggestions}
            onRefresh={() => void loadProviders()}
            onChange={(id, patch) => void saveSettings(id, patch)}
            saving={saving}
            loading={loading}
            catalogLoading={catalogLoading}
          />
        )}
        <IdentifyPlayground
          mode={mode}
          onModeChange={setMode}
          running={running}
          result={result}
          error={error}
          onRun={(request) => void run(request)}
        />
        {historyError ? (
          <ApiDown detail={formatApiFailure(historyError, t.admin)} />
        ) : (
          <IdentifyHistory
            records={history}
            filter={filter}
            onFilterChange={setFilter}
            onRefresh={() => void loadHistory()}
            loading={historyLoading}
          />
        )}
      </Stack>
    </AdminPage>
  )
}
