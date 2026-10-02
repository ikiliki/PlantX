import { useI18n } from '../../../../i18n/I18nProvider'
import { Root } from './VerifiedStamp.styles'

/** Blue verified mark. `stamp` floats on a card, `inline` sits in a row, `icon` is the check only. */
export function VerifiedStamp({ place = 'stamp' }: { place?: 'stamp' | 'inline' | 'icon' }) {
  const { t } = useI18n()
  return (
    <Root $place={place} aria-label={t.greenhouse.verifiedGreenhouse}>
      <span aria-hidden>✓</span>
      {place === 'icon' ? null : t.greenhouse.verified}
    </Root>
  )
}
