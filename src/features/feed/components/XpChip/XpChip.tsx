import { useI18n } from '../../../../i18n/I18nProvider'
import type { FeedUpdateKind } from '../../../../mock/types'
import { activityXp } from '../../activityXp'
import { Root } from './XpChip.styles'

/** "+10 XP" on an activity that earned XP (a new plant, completed care). Renders nothing otherwise. */
export function XpChip({ kind }: { kind?: FeedUpdateKind }) {
  const { t } = useI18n()
  const xp = kind ? activityXp(kind) : undefined
  if (xp == null) return null
  return <Root>{t.feed.xpEarned.replace('{n}', String(xp))}</Root>
}
