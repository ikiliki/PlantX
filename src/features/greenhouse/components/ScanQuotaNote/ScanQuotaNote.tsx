import { useI18n } from '../../../../i18n/I18nProvider'
import type { ScanQuota } from '../../../../mock/types'
import { Dot, Dots, Root, Text } from './ScanQuotaNote.styles'

/**
 * How many AI scans a member has left today (#67), shown above Continue with AI. One dot per scan of
 * today's allowance; used ones are hollow. At zero it says when the scans come back.
 */
export function ScanQuotaNote({ quota }: { quota: ScanQuota }) {
  const { t } = useI18n()
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
