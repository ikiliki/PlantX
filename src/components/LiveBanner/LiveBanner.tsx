import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import { Bar, Retry, Text } from './LiveBanner.styles'

/** Product shell only. The HTTP status and server text stay on the admin screens. */
export function LiveBanner() {
  const { t } = useI18n()
  const { liveStatus, retryLive } = useStore()

  if (liveStatus !== 'down') return null

  return (
    <Bar role="status">
      <Text>{t.http.fail}</Text>
      <Retry type="button" onClick={() => void retryLive()}>
        {t.common.retry}
      </Retry>
    </Bar>
  )
}
