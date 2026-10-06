import { useCallback, useEffect, useState } from 'react'
import { RefreshButton } from '../../../../components/RefreshButton/RefreshButton'
import { useI18n } from '../../../../i18n/I18nProvider'
import { formatApiFailure } from '../../../../lib/apiFailure'
import { fetchSystemHealthOutcome } from '../../../../mock/liveApi'
import { useStore } from '../../../../mock/store'
import type { SystemHealth } from '../../../../mock/types'
import { Dot, Head, Lead, Note, Root, Row, Rows, Updated, type HealthTone } from './SystemHealth.styles'

type Line = { id: string; label: string; tone: HealthTone; value: string }

function healthLines(health: SystemHealth, t: ReturnType<typeof useI18n>['t'], time: (iso: string) => string): Line[] {
  const a = t.admin
  const { applied, expected } = health.migration
  const errors = health.errors
  const failures = errors.server.count + errors.client.count
  const last = [errors.server, errors.client]
    .filter((item) => item.lastAt)
    .sort((x, y) => String(y.lastAt).localeCompare(String(x.lastAt)))[0]
  return [
    {
      id: 'api',
      label: a.healthApi,
      tone: 'ok',
      value: [health.api.version, health.api.env, health.api.region].filter(Boolean).join(' · '),
    },
    {
      id: 'db',
      label: a.healthDb,
      tone: health.database.ok ? (health.database.ms > 1500 ? 'warn' : 'ok') : 'bad',
      value: health.database.ok
        ? a.healthDbMs.replace('{ms}', String(health.database.ms))
        : a.healthDbDown.replace('{detail}', health.database.error ?? ''),
    },
    {
      id: 'migrations',
      label: a.healthMigrations,
      tone: applied && applied === expected ? 'ok' : applied && expected && applied < expected ? 'bad' : 'warn',
      value:
        applied && applied === expected
          ? a.healthMigrationsMatch.replace('{version}', applied)
          : applied
            ? a.healthMigrationsBehind.replace('{applied}', applied).replace('{expected}', expected ?? '—')
            : a.healthMigrationsUnknown.replace('{expected}', expected ?? '—'),
    },
    {
      id: 'identify',
      label: a.healthIdentify,
      tone: health.identify.ready ? 'ok' : 'warn',
      value: health.identify.ready
        ? a.healthIdentifyReady
        : a.healthIdentifyMissing.replace('{n}', String(health.identify.missing)),
    },
    {
      id: 'errors',
      label: a.healthErrors,
      tone: failures === 0 ? 'ok' : 'warn',
      value:
        failures === 0 || !last?.lastAt
          ? a.healthErrorsNone.replace('{time}', time(errors.since))
          : a.healthErrorsSome
              .replace('{server}', String(errors.server.count))
              .replace('{client}', String(errors.client.count))
              .replace('{time}', time(last.lastAt))
              .replace('{message}', last.lastMessage ?? ''),
    },
    {
      id: 'alerts',
      label: a.healthAlerts,
      tone: health.alerts.configured ? 'ok' : 'warn',
      value: health.alerts.configured ? a.healthAlertsOn : a.healthAlertsOff,
    },
  ]
}

/**
 * Admin → System health (#56): one row per part with a status dot. `health` null while the first check runs;
 * `error` when the API could not answer. Presentational, so stories and the panel share it.
 */
export function SystemHealthView({
  health,
  loading,
  error,
  onRefresh,
}: {
  health: SystemHealth | null
  loading: boolean
  error?: string | null
  onRefresh?: () => void
}) {
  const { t, locale } = useI18n()
  const time = (iso: string) =>
    new Date(iso).toLocaleString(locale === 'he' ? 'he-IL' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  return (
    <Root aria-labelledby="system-health-title" data-system-health>
      <Head>
        <div>
          <h2 id="system-health-title">{t.admin.healthTitle}</h2>
          <Lead>{t.admin.healthLead}</Lead>
        </div>
        {onRefresh ? <RefreshButton label={t.admin.healthRefresh} busy={loading} onClick={onRefresh} /> : null}
      </Head>
      {error ? <Note $tone="bad">{t.admin.healthError.replace('{detail}', error)}</Note> : null}
      {!health && loading ? <Note role="status">{t.admin.healthLoading}</Note> : null}
      {health ? (
        <>
          <Rows>
            {healthLines(health, t, time).map((line) => (
              <Row key={line.id} data-health-row={line.id} data-tone={line.tone}>
                <Dot $tone={line.tone} aria-hidden />
                <dt>{line.label}</dt>
                <dd>{line.value}</dd>
              </Row>
            ))}
          </Rows>
          <Updated>{t.admin.healthUpdated.replace('{time}', time(health.checkedAt))}</Updated>
        </>
      ) : null}
    </Root>
  )
}

/** Reads `GET /api/system/health`. Mock mode has no API, so it says so instead of checking. */
export function SystemHealthCard() {
  const { t } = useI18n()
  const { plantxEnv } = useStore()
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(plantxEnv !== 'mock')
  const [error, setError] = useState<string | null>(null)

  const check = useCallback(async () => {
    setLoading(true)
    const res = await fetchSystemHealthOutcome()
    if (res.ok) {
      setHealth(res.data.health)
      setError(null)
    } else {
      setError(formatApiFailure(res.failure, t.admin))
    }
    setLoading(false)
  }, [t.admin])

  useEffect(() => {
    if (plantxEnv === 'mock') return
    void check()
  }, [check, plantxEnv])

  if (plantxEnv === 'mock') {
    return (
      <Root aria-labelledby="system-health-title" data-system-health>
        <Head>
          <h2 id="system-health-title">{t.admin.healthTitle}</h2>
        </Head>
        <Note>{t.admin.healthMock}</Note>
      </Root>
    )
  }
  return <SystemHealthView health={health} loading={loading} error={error} onRefresh={() => void check()} />
}
