import { useId } from 'react'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { IdentifyFieldMark } from '../../../../mock/types'
import { Stamp, Tip, TipLabel, TipValue, Wrap } from './AiFieldStamp.styles'

/**
 * Per-field AI provenance: blue ✦ when the AI's value was kept, ✎ when the owner changed it.
 * Hover, focus or a tap opens a small tooltip; a changed field shows what the AI suggested.
 * `corner` pins it to the top inline-end corner of a stat tile; inline otherwise.
 */
export function AiFieldStamp({
  mark,
  aiLabel,
  corner,
}: {
  mark: IdentifyFieldMark
  /** The AI's suggestion as a label (option name, size, stage). */
  aiLabel?: string
  corner?: boolean
}) {
  const { t } = useI18n()
  const id = useId()
  if (mark.check === 'manual') return null
  const changed = mark.check === 'changed'
  const label = changed ? t.passport.aiChanged : t.passport.aiFilled
  return (
    <Wrap $corner={corner}>
      <Stamp tabIndex={0} role="img" $changed={changed} aria-label={label} aria-describedby={id}>
        {changed ? '✎' : '✦'}
      </Stamp>
      <Tip id={id} role="tooltip">
        {changed ? (
          <>
            <TipLabel>✦ {t.passport.aiSuggested}</TipLabel>
            <TipValue>{aiLabel ?? '—'}</TipValue>
          </>
        ) : (
          <TipLabel>✦ {t.passport.aiFilled}</TipLabel>
        )}
      </Tip>
    </Wrap>
  )
}
