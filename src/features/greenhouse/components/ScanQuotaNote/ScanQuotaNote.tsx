import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { ScanQuota } from '../../../../mock/types'
import { Dot, Dots, Root, Text } from './ScanQuotaNote.styles'

/**
 * How many AI scans a member has left today (#67), shown above Continue with AI. One dot per scan of
 * today's allowance; used ones are hollow. At zero it says when the scans come back.
 */
export function ScanQuotaNote({ quota, unlimited = false }: { quota?: ScanQuota | null; unlimited?: boolean }) {
  const { t } = useI18n()
  if (unlimited) {
    return (
      <Root role="status" $out={false} data-scan-quota="unlimited">
        <Text>{t.addPlant.quotaUnlimited}</Text>
      </Root>
    )
  }
  if (!quota) return null
  const total = Math.max(0, quota.limit + quota.extra)
  const left = Math.min(quota.remaining, total)
  const out = quota.remaining <= 0
  return (
    <Root role="status" $out={out} data-scan-quota>
      {total > 0 && total <= 12 ? (
        <Dots aria-hidden>
          {Array.from({ length: total }, (_, index) => (
            <Dot key={index} $on={index < left} />
          ))}
        </Dots>
      ) : null}
      <Text>
        {out
          ? t.addPlant.quotaNone
          : t.addPlant.quotaLeft.replace('{left}', String(left)).replace('{total}', String(total))}
      </Text>
    </Root>
  )
}

/**
 * The signed-in member's allowance, wherever it is shown (#72): Add Plant, Settings, the account dialog,
 * the greenhouse header. The admin is not limited. Nothing for a guest, or before the quota loads.
 */
export function MyScanAllowance() {
  const { signedIn, currentUser, scanQuota } = useStore()
  if (!signedIn || !currentUser) return null
  if (currentUser.role === 'admin') return <ScanQuotaNote unlimited />
  return scanQuota ? <ScanQuotaNote quota={scanQuota} /> : null
}
