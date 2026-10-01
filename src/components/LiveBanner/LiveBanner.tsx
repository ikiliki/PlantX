import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import { Bar, Retry, Text } from './LiveBanner.styles'

/** Shown when the live API is unreachable; UI keeps browsing shell data. */
export function LiveBanner() {
  const { t } = useI18n()
  const { liveStatus, retryLive } = useStore()

  if (liveStatus !== 'down') return null

  return (
    <Bar role="status">
      <Text>{t.common.serverDown}</Text>
      <Retry type="button" onClick={() => void retryLive()}>
        {t.common.retry}
      </Retry>
    </Bar>
  )
}
