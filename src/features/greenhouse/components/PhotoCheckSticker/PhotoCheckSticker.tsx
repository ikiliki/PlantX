import { useI18n } from '../../../../i18n/I18nProvider'
import type { PhotoCheck } from '../../../../mock/types'
import { Label, Pct, Root, type StickerTone } from './PhotoCheckSticker.styles'

const TONE: Record<PhotoCheck['result'], StickerTone> = {
  match: 'ok',
  mismatch: 'warn',
  notPlant: 'bad',
  failed: 'bad',
  unscanned: 'idle',
}

/** Per-photo AI result stamped on a photo. Pass `scanning` while the photo is still with the providers. */
export function PhotoCheckSticker({
  check,
  scanning,
  size = 'sm',
}: {
  check?: PhotoCheck
  scanning?: boolean
  size?: 'sm' | 'md'
}) {
  const { t } = useI18n()
  if (scanning) {
    return (
      <Root $tone="busy" $size={size} role="status">
        <Label>✦ {t.addPlant.stickerScanning}</Label>
      </Root>
    )
  }
  if (!check) return null

  const pct = check.probability != null ? `${Math.round(check.probability * 100)}%` : ''
  const compactMatch = size === 'sm' && pct
  const text =
    check.result === 'match'
      ? compactMatch
        ? `✓ ${pct}`
        : `✓ ${t.addPlant.stickerMatch}`
      : check.result === 'mismatch'
        ? `≠ ${t.addPlant.stickerMismatch}`
        : check.result === 'notPlant'
          ? `✕ ${t.addPlant.stickerNotPlant}`
          : check.result === 'failed'
            ? `! ${t.addPlant.stickerFailed}`
            : t.addPlant.stickerUnscanned
  const title = [
    t.addPlant.stickerPhoto.replace('{n}', String(check.position + 1)),
    check.label ? t.addPlant.stickerSaw.replace('{label}', check.label) : '',
    pct,
    check.mode === 'mock' ? t.addPlant.badgeDemo : '',
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <Root $tone={TONE[check.result]} $size={size} title={title} aria-label={`${text}. ${title}`}>
      <Label>{text}</Label>
      {check.result === 'match' && pct && !compactMatch ? <Pct>{pct}</Pct> : null}
    </Root>
  )
}
