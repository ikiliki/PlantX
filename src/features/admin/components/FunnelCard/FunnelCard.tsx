import { useCallback, useEffect, useState } from 'react'
import { RefreshButton } from '../../../../components/RefreshButton/RefreshButton'
import { useI18n } from '../../../../i18n/I18nProvider'
import { FUNNEL_DAYS, FUNNEL_STEPS } from '../../../../lib/analytics'
import { formatApiFailure } from '../../../../lib/apiFailure'
import { fetchFunnelOutcome } from '../../../../mock/liveApi'
import { useStore } from '../../../../mock/store'
import type { FunnelDay } from '../../../../mock/types'
import { Head, Lead, Note, Root } from '../SystemHealth/SystemHealth.styles'
import { Scroll, Table } from './FunnelCard.styles'

/**
 * Admin → System funnel (#59): one row per step, a total and one column per day (newest first).
 * Each cell is events, with distinct signed-in people in brackets when they differ. Presentational.
 */
export function FunnelView({
  days,
  loading,
  error,
  onRefresh,
}: {
  days: FunnelDay[] | null
  loading: boolean
  error?: string | null
  onRefresh?: () => void
}) {
  const { t } = useI18n()
  const newest = [...(days ?? [])].reverse()
  const cell = (events = 0, people = 0) => (
    <>
      {events}
      {people > 0 && people !== events ? <small> ({people})</small> : null}
    </>
  )
  return (
    <Root aria-labelledby="funnel-title" data-funnel>
      <Head>
        <div>
          <h2 id="funnel-title">{t.legal.funnelTitle}</h2>
          <Lead>{t.legal.funnelLead.replace('{days}', String(FUNNEL_DAYS))}</Lead>
        </div>
        {onRefresh ? <RefreshButton label={t.legal.funnelTitle} busy={loading} onClick={onRefresh} /> : null}
      </Head>
      {error ? <Note $tone="bad">{error}</Note> : null}
      {days && days.length === 0 ? <Note>{t.legal.funnelEmpty}</Note> : null}
      {days && days.length > 0 ? (
        <Scroll>
          <Table>
            <thead>
              <tr>
                <th scope="col">{t.legal.funnelStep}</th>
                <th scope="col">{t.legal.funnelTotal}</th>
                {newest.map((day) => (
                  <th key={day.day} scope="col">
                    {day.day.slice(5)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FUNNEL_STEPS.map((step) => {
                const total = newest.reduce((sum, day) => sum + (day.counts[step] ?? 0), 0)
                return (
                  <tr key={step} data-funnel-step={step}>
                    <th scope="row">{t.legal.steps[step]}</th>
                    <td>{total}</td>
                    {newest.map((day) => (
                      <td key={day.day}>{cell(day.counts[step], day.people[step])}</td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </Scroll>
      ) : null}
    </Root>
  )
}

/** Reads `GET /api/events/funnel`. Mock mode records nothing, so it says so. */
export function FunnelCard() {
  const { t } = useI18n()
  const { plantxEnv } = useStore()
  const [days, setDays] = useState<FunnelDay[] | null>(null)
  const [loading, setLoading] = useState(plantxEnv !== 'mock')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetchFunnelOutcome()
    if (res.ok) {
      setDays(res.data.days)
      setError(null)
    } else {
      setError(formatApiFailure(res.failure, t.admin))
    }
    setLoading(false)
  }, [t.admin])

  useEffect(() => {
    if (plantxEnv === 'mock') return
    void load()
  }, [load, plantxEnv])

  if (plantxEnv === 'mock') return <FunnelView days={[]} loading={false} />
  return <FunnelView days={days} loading={loading} error={error} onRefresh={() => void load()} />
}
