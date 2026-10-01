import { useCallback, useEffect, useRef, useState } from 'react'
import { AdminPage } from '../../features/admin/components/AdminPage/AdminPage'
import { ApisPanel } from '../../features/admin/components/ApisPanel/ApisPanel'
import {
  IdentifyHistory,
  type IdentifyHistoryFilter,
} from '../../features/admin/components/IdentifyHistory/IdentifyHistory'
import { IdentifyPlayground } from '../../features/admin/components/IdentifyPlayground/IdentifyPlayground'
import { useI18n } from '../../i18n/I18nProvider'
import { fetchIdentifyHistory, fetchIdentifyProviders, postIdentifyTest } from '../../mock/liveApi'
import { useStore } from '../../mock/store'
import type {
  IdentifyMode,
  IdentifyProviderStatus,
  IdentifyRequestRecord,
  IdentifyTestRequest,
} from '../../mock/types'
import { Stack } from './ApisPage.styles'

const HISTORY_LIMIT = 50

export function ApisPage() {
  const { t } = useI18n()
  const { currentUser } = useStore()
  const [providers, setProviders] = useState<IdentifyProviderStatus[]>([])
  const [defaultMode, setDefaultMode] = useState<IdentifyMode>()
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<IdentifyHistoryFilter>('all')
  const [history, setHistory] = useState<IdentifyRequestRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const historyRequest = useRef(0)
  const [mode, setMode] = useState<IdentifyMode>('mock')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<IdentifyRequestRecord | null>(null)
  const [error, setError] = useState<string>()

  const loadProviders = useCallback(async () => {
    setLoading(true)
    const res = await fetchIdentifyProviders()
    setProviders(res?.providers ?? [])
    setDefaultMode(res?.defaultMode)
    setLoading(false)
  }, [])

  const loadHistory = useCallback(async () => {
    const id = ++historyRequest.current
    setHistoryLoading(true)
    const res = await fetchIdentifyHistory({
      mode: filter === 'all' ? undefined : filter,
      limit: HISTORY_LIMIT,
    })
    if (id !== historyRequest.current) return
    setHistory(res?.requests ?? [])
    setHistoryLoading(false)
  }, [filter])

  useEffect(() => {
    void loadProviders()
  }, [loadProviders])

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
        <ApisPanel
          providers={providers}
          defaultMode={defaultMode}
          onRefresh={() => void loadProviders()}
          loading={loading}
        />
        <IdentifyPlayground
          mode={mode}
          onModeChange={setMode}
          running={running}
          result={result}
          error={error}
          onRun={(request) => void run(request)}
        />
        <IdentifyHistory
          records={history}
          filter={filter}
          onFilterChange={setFilter}
          onRefresh={() => void loadHistory()}
          loading={historyLoading}
        />
      </Stack>
    </AdminPage>
  )
}
