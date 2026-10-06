import { useState } from 'react'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { ScanQuota } from '../../../../mock/types'
import { Copy, Count, Detail, Head, Label, Root, Segment, Segments, Spark } from './ScanQuotaNote.styles'

/**
 * How many AI scans a member has left today (#67), as a small tile: a count and one segment per scan of
 * today's allowance (used ones go gray). Tapping it shows when the scans reset; at zero that line stays open.
 */
export function ScanQuotaNote({ quota, unlimited = false }: { quota?: ScanQuota | null; unlimited?: boolean }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  if (!unlimited && !quota) return null

  const total = quota ? Math.max(0, quota.limit + quota.extra) : 0
  const left = quota ? Math.min(quota.remaining, total) : 0
  const out = !unlimited && left <= 0
  const shown = open || out
  const count = unlimited
    ? t.addPlant.quotaShortUnlimited
    : out
      ? t.addPlant.quotaShortNone
      : t.addPlant.quotaShort.replace('{left}', String(left)).replace('{total}', String(total))
  const detail = unlimited ? t.addPlant.quotaAdmin : out ? t.addPlant.quotaBack : t.addPlant.quotaResets

  return (
    <Root
      type="button"
      $out={out}
      $open={shown}
      aria-expanded={shown}
      onClick={() => setOpen((value) => !value)}
      data-scan-quota={unlimited ? 'unlimited' : ''}
    >
      <Spark aria-hidden $out={out}>
        ✦
      </Spark>
      <Copy>
        <Head>
          <Label>{t.addPlant.quotaLabel}</Label>
          <Count role="status" $out={out}>
            {count}
          </Count>
        </Head>
        {unlimited ? (
          <Segments aria-hidden>
            <Segment $on />
          </Segments>
        ) : total > 0 && total <= 12 ? (
          <Segments aria-hidden>
            {Array.from({ length: total }, (_, index) => (
              <Segment key={index} $on={index < left} />
            ))}
          </Segments>
        ) : null}
      </Copy>
      {shown ? <Detail>{detail}</Detail> : null}
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
