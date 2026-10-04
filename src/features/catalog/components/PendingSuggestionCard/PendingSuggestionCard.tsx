import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { defaultPlantPhoto } from '../../../../mock/images'
import type { CatalogSuggestion } from '../../../../mock/types'
import { Body, Card, Meta, Name, Pending, Photo, Scientific } from './PendingSuggestionCard.styles'

/** A member's own suggestion in their Catalog until an admin adds or declines it. Not a link: there is no page yet. */
export function PendingSuggestionCard({ suggestion }: { suggestion: CatalogSuggestion }) {
  const { t, locale } = useI18n()
  const { draft } = suggestion
  const photo = draft.subcategory.photo || draft.category.photo || defaultPlantPhoto
  const category = locale === 'he' && draft.category.nameHe ? draft.category.nameHe : draft.category.name

  return (
    <Card data-testid="pending-suggestion" aria-label={`${suggestion.name}, ${t.suggest.pending}`}>
      <Photo>
        <PlantImage src={photo} alt="" />
        <Pending>{t.suggest.pending}</Pending>
      </Photo>
      <Body>
        <Name>{suggestion.name}</Name>
        {suggestion.scientificName ? <Scientific>{suggestion.scientificName}</Scientific> : null}
        <Meta>
          {draft.categoryId ? <span>{t.suggest.varietyOf.replace('{category}', category)}</span> : null}
          <span>{suggestion.origin === 'identify' ? t.suggest.fromScan : t.suggest.fromForm}</span>
        </Meta>
      </Body>
    </Card>
  )
}
