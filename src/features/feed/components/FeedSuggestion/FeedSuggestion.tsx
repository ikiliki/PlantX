import { Icon } from '../../../../components/Icon/Icon'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { isPlacementEnabled } from '../../../../theme/release'
import { speciesName } from '../../../market/categoryData'
import { catalogSpeciesList } from '../../../species/catalogSpecies'
import { wikiHref } from '../../../species/components/GuideLink/GuideLink'
import { speciesPhoto } from '../../../species/speciesPhoto'
import { Action, Body, Card, Copy, Eyebrow, Glyph, Thumb, Title } from './FeedSuggestion.styles'

export type FeedSuggestionKind = 'tip' | 'rank' | 'market'

/** Which suggestions the feed may weave in: catalog tips always, rank and market only while their boards are on. */
export function useSuggestionKinds(): FeedSuggestionKind[] {
  const { db } = useStore()
  const kinds: FeedSuggestionKind[] = []
  if (isPlacementEnabled(db.system, 'wiki.board') && catalogSpeciesList(db).length > 0) kinds.push('tip')
  if (isPlacementEnabled(db.system, 'rank.board')) kinds.push('rank')
  if (isPlacementEnabled(db.system, 'market.board')) kinds.push('market')
  return kinds
}

/**
 * A card the Feed tab mixes in between posts: a catalog species with its light and growth, a nudge to rank,
 * or a nudge to the market. `seed` picks which catalog species, so each tip in a scroll is a different one.
 */
export function FeedSuggestion({ kind, seed = 0 }: { kind: FeedSuggestionKind; seed?: number }) {
  const { t, tr, locale } = useI18n()
  const { db } = useStore()

  if (kind === 'tip') {
    const list = catalogSpeciesList(db)
    const species = list[seed % Math.max(list.length, 1)]
    if (!species) return null
    return (
      <Card to={wikiHref(species.id)} $kind="tip" data-feed-suggestion="tip">
        <Thumb>
          <PlantImage src={speciesPhoto(db, species.id)} alt="" loading="lazy" />
        </Thumb>
        <Copy>
          <Eyebrow>{t.feedPage.tipEyebrow}</Eyebrow>
          <Title>{speciesName(species, locale)}</Title>
          <Body>
            {t.feedPage.tipLine
              .replace('{light}', tr(species.conditions.light, species.conditions.lightHe))
              .replace('{growth}', tr(species.growthTime.en, species.growthTime.he))}
          </Body>
        </Copy>
      </Card>
    )
  }

  const rank = kind === 'rank'
  return (
    <Card to={rank ? '/rank' : '/market'} $kind={kind} data-feed-suggestion={kind}>
      <Glyph aria-hidden>
        <Icon name={rank ? 'rank' : 'market'} size={26} />
      </Glyph>
      <Copy>
        <Eyebrow>{rank ? t.feedPage.rankEyebrow : t.feedPage.marketEyebrow}</Eyebrow>
        <Title>{rank ? t.feedPage.rankTitle : t.feedPage.marketTitle}</Title>
        <Body>{rank ? t.feedPage.rankBody : t.feedPage.marketBody}</Body>
        <Action>{rank ? t.feedPage.rankAction : t.feedPage.marketAction}</Action>
      </Copy>
    </Card>
  )
}
