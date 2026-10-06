import { useEffect, useState } from 'react'
import { useI18n } from '../../../../i18n/I18nProvider'
import { fetchSystemHealthOutcome } from '../../../../mock/liveApi'
import type { EnvGap } from '../../../../mock/liveApi'
import { Box } from './EnvMissing.styles'

function clientGaps(): EnvGap[] {
  const id = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim()
  if (id) return []
  return [{ name: 'VITE_GOOGLE_CLIENT_ID', need: 'app' }]
}

/** Names only. Empty when every expected variable is set. */
export function EnvMissing({ names }: { names?: EnvGap[] }) {
  const { t } = useI18n()
  const [gaps, setGaps] = useState<EnvGap[]>(names ?? clientGaps())

  useEffect(() => {
    if (names) return
    let cancel = false
    void fetchSystemHealthOutcome().then((res) => {
      if (cancel || !res.ok) return
      const seen = new Set<string>()
      const next = [...clientGaps(), ...res.data.health.missing].filter((gap) => {
        if (seen.has(gap.name)) return false
        seen.add(gap.name)
        return true
      })
      setGaps(next)
    })
    return () => {
      cancel = true
    }
  }, [names])

  if (gaps.length === 0) return null

  return (
    <Box role="status">
      <strong>{t.admin.envMissing}</strong>
      <ul>
        {gaps.map((gap) => (
          <li key={gap.name}>
            <code>{gap.name}</code>
            {' — '}
            {gap.need === 'app' ? t.admin.envNeedApp : t.admin.envNeedIdentify}
          </li>
        ))}
      </ul>
    </Box>
  )
}
