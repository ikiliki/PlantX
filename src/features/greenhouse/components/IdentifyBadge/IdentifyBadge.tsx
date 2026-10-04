import { useI18n } from '../../../../i18n/I18nProvider'
import type { PlantIdentification } from '../../../../mock/types'
import { Detail, EditedTag, Mark, Root, Row, Text } from './IdentifyBadge.styles'

/** Any class field the owner changed away from the AI's answer. */
export function wasHandEdited(identification?: PlantIdentification) {
  const fields = identification?.fields
  if (!fields) return false
  return Object.values(fields).some((mark) => mark?.check === 'changed')
}

/**
 * Who identified the plant class. `compact` is the card tag; the full badge spells out provider and confidence.
 * A plant with no record (added before identify existed) reads as filled in by hand.
 * `notInCatalog`: the plant is saved as Other. With an `ai` record that means the AI recognized it
 * but the catalog has no class for it yet — still AI verified, not edited by hand.
 *
 * Three states from the design: filled by hand (no AI), AI verified and untouched, and AI verified
 * but a detail changed by hand — then the AI stamp stays and a second "Manually edited" tag sits beside it.
 */
export function IdentifyBadge({
  identification,
  compact,
  notInCatalog = false,
}: {
  identification?: PlantIdentification
  compact?: boolean
  notInCatalog?: boolean
}) {
  const { t } = useI18n()
  const { source, probability, mode, label }: PlantIdentification = identification ?? { source: 'manual', at: '' }
  const pct = probability != null ? Math.round(probability * 100) : null
  const aiOther = source === 'ai' && notInCatalog
  // An AI plant whose class still matches but had another detail (e.g. size) changed by hand.
  const alsoEdited = source === 'ai' && wasHandEdited(identification)

  const title =
    source === 'ai'
      ? t.addPlant.badgeAiBy
      : source === 'edited'
        ? t.addPlant.badgeManuallyEdited
        : t.addPlant.badgeAddedByHand

  const detail =
    source === 'ai'
      ? [
          aiOther ? t.addPlant.badgeNotInCatalog.replace('{label}', label ?? '') : '',
          pct != null ? t.addPlant.confidencePct.replace('{pct}', String(pct)) : '',
          mode === 'mock' ? t.addPlant.badgeDemo : '',
        ]
          .filter(Boolean)
          .join(' · ')
      : source === 'edited'
        ? t.addPlant.badgeEditedDetail.replace('{label}', label ?? '')
        : identification
          ? t.addPlant.badgeManualDetail
          : ''

  const short = aiOther
    ? t.addPlant.badgeOtherShort
    : source === 'ai'
      ? 'AI'
      : source === 'edited'
        ? t.addPlant.badgeEditedShort
        : t.addPlant.badgeManualShort

  const chip = (
    <Root
      $source={source}
      $compact={compact}
      data-not-in-catalog={aiOther ? 'true' : undefined}
      title={compact ? [title, detail].filter(Boolean).join(' — ') : undefined}
    >
      {source !== 'manual' ? (
        <Mark aria-hidden $source={source}>{source === 'ai' ? '✦' : '✎'}</Mark>
      ) : null}
      <Text>
        {compact ? short : title}
        {!compact && detail ? <Detail>{detail}</Detail> : null}
      </Text>
    </Root>
  )

  if (!alsoEdited) return chip

  // State 3: keep the AI stamp, add a "Manually edited" tag next to it.
  return (
    <Row data-also-edited="true">
      {chip}
      <EditedTag $compact={compact} title={compact ? t.addPlant.editedTag : undefined}>
        <span aria-hidden>✎</span>
        {compact ? t.addPlant.editedTagShort : t.addPlant.editedTag}
      </EditedTag>
    </Row>
  )
}
