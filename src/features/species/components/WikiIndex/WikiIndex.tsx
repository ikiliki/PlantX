import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Button } from '../../../../components/Button/Button'
import { useI18n } from '../../../../i18n/I18nProvider'
import { createCatalog } from '../../../../mock/catalog'
import { useStore } from '../../../../mock/store'
import { useAuth } from '../../../auth/AuthProvider'
import { PendingSuggestionCard } from '../../../catalog/components/PendingSuggestionCard/PendingSuggestionCard'
import { SuggestPlantDialog } from '../../../catalog/components/SuggestPlantDialog/SuggestPlantDialog'
import { useMySuggestions } from '../../../catalog/useCatalogSuggestions'
import type { ComponentView } from '../../../../theme/view'
import { catalogSpeciesList } from '../../catalogSpecies'
import { speciesName } from '../../../market/categoryData'
import { groupByRarity, wikiRarityTitle } from '../../wikiGroups'
import { wikiHref } from '../GuideLink/GuideLink'
import { WikiCard } from '../WikiCard/WikiCard'
import { WikiSection } from '../WikiSection/WikiSection'
import { WikiToc } from '../WikiToc/WikiToc'
import { Body, Empty, Grid, Layout, SuggestRow, TocWrap } from './WikiIndex.styles'

export function WikiIndex({ speciesIds, view = 'page' }: { speciesIds?: string[]; view?: ComponentView }) {
  const { db } = useStore()
  const { t, locale } = useI18n()
  const loc = useLocation()
  const listed = catalogSpeciesList(db)
  const rows = speciesIds ? listed.filter((item) => speciesIds.includes(item.id)) : listed
  const groups = groupByRarity(rows).map((group) => ({
    ...group,
    // Each catalog group shows how many species it holds.
    title: `${wikiRarityTitle(group.rarity, t.plant)} (${group.items.length})`,
  }))
  const [open, setOpen] = useState<Record<string, boolean>>({ common: true, suggestions: true })
  const { signedIn, openAuth } = useAuth()
  const { suggestions, submit } = useMySuggestions()
  const [suggesting, setSuggesting] = useState(false)
  // The full catalog page offers the form and the member's pending rows; a widget or a filtered list does not.
  const withSuggestions = view === 'page' && !speciesIds

  useEffect(() => {
    const hash = loc.hash.replace('#', '')
    if (!hash) return
    setOpen((current) => ({ ...current, [hash]: true }))
    window.requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [loc.hash])

  const suggest = () => {
    if (signedIn) setSuggesting(true)
    else openAuth('sensitive', () => setSuggesting(true))
  }

  const suggestRow = withSuggestions ? (
    <SuggestRow>
      <p>{t.suggest.ctaLead}</p>
      <Button type="button" size="sm" variant="secondary" onClick={suggest}>
        ＋ {t.suggest.cta}
      </Button>
    </SuggestRow>
  ) : null

  const pendingSection =
    withSuggestions && suggestions.length > 0 ? (
      <WikiSection
        id="suggestions"
        title={t.suggest.pendingTitle.replace('{count}', String(suggestions.length))}
        open={Boolean(open.suggestions)}
        onToggle={() => setOpen((current) => ({ ...current, suggestions: !current.suggestions }))}
      >
        <Grid>
          {suggestions.map((item) => (
            <PendingSuggestionCard key={item.id} suggestion={item} />
          ))}
        </Grid>
      </WikiSection>
    ) : null

  const dialog = suggesting ? (
    <SuggestPlantDialog catalog={db.catalog ?? createCatalog()} onSubmit={submit} onClose={() => setSuggesting(false)} />
  ) : null

  if (rows.length === 0) {
    return (
      <Body>
        {suggestRow}
        {pendingSection}
        <Empty>{t.guide.empty}</Empty>
        {dialog}
      </Body>
    )
  }

  return (
    <Layout data-view={view}>
      {view === 'page' ? (
        <TocWrap>
          <WikiToc
            items={groups.map((group) => ({
              id: group.rarity,
              title: group.title,
              children: group.items.map((species) => ({
                id: species.id,
                title: speciesName(species, locale),
                href: wikiHref(species.id),
              })),
            }))}
          />
        </TocWrap>
      ) : null}
      <Body>
        {suggestRow}
        {pendingSection}
        {groups.map((group) => (
          <WikiSection
            key={group.rarity}
            id={group.rarity}
            title={group.title}
            open={Boolean(open[group.rarity])}
            onToggle={() => setOpen((current) => ({ ...current, [group.rarity]: !current[group.rarity] }))}
          >
            <Grid>
              {group.items.map((species) => (
                <WikiCard key={species.id} species={species} />
              ))}
            </Grid>
          </WikiSection>
        ))}
      </Body>
      {dialog}
    </Layout>
  )
}
