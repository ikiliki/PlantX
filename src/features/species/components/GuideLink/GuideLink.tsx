import { useI18n } from '../../../../i18n/I18nProvider'
import { Arrow, Copy, Hint, Leaf, Root, Title } from './GuideLink.styles'

export type SpeciesTab = 'wiki' | 'market'

export function wikiHref(speciesId?: string) {
  return speciesId ? `/wiki/${speciesId}` : '/wiki'
}

export function speciesHref(speciesId: string, tab: SpeciesTab = 'wiki') {
  return tab === 'wiki' ? wikiHref(speciesId) : `/market/categories/${speciesId}`
}

export function GuideLink({ speciesId, name }: { speciesId: string; name: string }) {
  const { t } = useI18n()
  return (
    <Root to={speciesHref(speciesId)} data-guide-link>
      <Leaf aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z" />
          <path d="M5 19 13 11" />
        </svg>
      </Leaf>
      <Copy>
        <Title>{t.guide.link}</Title>
        <Hint>{t.guide.linkHint.replace('{name}', name)}</Hint>
      </Copy>
      <Arrow aria-hidden>→</Arrow>
    </Root>
  )
}
