import { useI18n } from '../../../../i18n/I18nProvider'
import type { PlantIdentification } from '../../../../mock/types'
import { Detail, Mark, Root, Text } from './IdentifyBadge.styles'

/**
 * Who identified the plant class. `compact` is the card tag; the full badge spells out provider and confidence.
 * A plant with no record (added before identify existed) reads as needing an AI check.
 */
export function IdentifyBadge({
  identification,
  compact,
}: {
  identification?: PlantIdentification
  compact?: boolean
}) {
  const { t } = useI18n()
  const { source, probability, mode, label }: PlantIdentification = identification ?? { source: 'manual', at: '' }
  const pct = probability != null ? Math.round(probability * 100) : null

  const title =
    source === 'ai' ? t.addPlant.badgeAiBy : source === 'edited' ? t.addPlant.badgeEdited : t.addPlant.badgeManual

  const detail =
    source === 'ai'
      ? [pct != null ? t.addPlant.confidencePct.replace('{pct}', String(pct)) : '', mode === 'mock' ? t.addPlant.badgeDemo : '']
          .filter(Boolean)
          .join(' · ')
      : source === 'edited'
        ? t.addPlant.badgeEditedDetail.replace('{label}', label ?? '')
        : identification
          ? t.addPlant.badgeManualDetail
          : ''

  const short = source === 'ai' ? 'AI' : source === 'edited' ? t.addPlant.badgeEditedShort : t.addPlant.badgeNeedsAi

  return (
    <Root $source={source} $compact={compact} title={compact ? [title, detail].filter(Boolean).join(' — ') : undefined}>
      <Mark aria-hidden $source={source}>
        {source === 'ai' ? '✦' : source === 'edited' ? '✎' : '!'}
      </Mark>
      <Text>
        {compact ? short : title}
        {!compact && detail ? <Detail>{detail}</Detail> : null}
      </Text>
    </Root>
  )
}
