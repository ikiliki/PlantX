import { useI18n } from '../../i18n/I18nProvider'
import { formatApiFailure } from '../../lib/apiFailure'
import { useStore } from '../../mock/store'
import { Bar, Retry, Text } from './LiveBanner.styles'

/** Shown on admin when the live API is unreachable. The text is why the last check failed. */
export function LiveBanner() {
  const { t } = useI18n()
  const { liveStatus, liveFailure, retryLive } = useStore()

  if (liveStatus !== 'down') return null

  return (
    <Bar role="status">
      <Text>{formatApiFailure(liveFailure, t.admin)}</Text>
      <Retry type="button" onClick={() => void retryLive()}>
        {t.common.retry}
      </Retry>
    </Bar>
  )
}
