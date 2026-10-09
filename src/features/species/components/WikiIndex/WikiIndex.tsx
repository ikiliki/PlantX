import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Button } from '../../../../components/Button/Button'
import { FilterChips } from '../../../../components/FilterChips/FilterChips'
import type { PlantRarity } from '../../../../mock/types'
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
import { WIKI_RARITY_ORDER, groupByRarity, wikiRarityTitle } from '../../wikiGroups'
import { CatalogPreview } from '../CatalogPreview/CatalogPreview'
import { CatalogTile } from '../CatalogTile/CatalogTile'
import { WikiCard } from '../WikiCard/WikiCard'
import { WikiSection } from '../WikiSection/WikiSection'
import { Body, Empty, Grid, Layout, Search, SuggestRow, TileGrid, Tools } from './WikiIndex.styles'

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
  const [query, setQuery] = useState('')
  const [rarity, setRarity] = useState<'all' | PlantRarity>('all')
  const [previewId, setPreviewId] = useState<string | null>(null)
  // The full catalog page offers the form and the member's pending rows; a widget or a filtered list does not.
  const withSuggestions = view === 'page' && !speciesIds

  useEffect(() => {
    const hash = loc.hash.replace('#', '')
    if (!hash) return
    // The Catalog menu links to a rarity (#rare): the page opens on that chip.
    if ((WIKI_RARITY_ORDER as string[]).includes(hash)) setRarity(hash as PlantRarity)
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

  if (view === 'page') {
    // Photo grid sorted by rarity (common first), then name; a search box and rarity chips narrow it.
    const needle = query.trim().toLocaleLowerCase()
    const rank = (value: PlantRarity) => WIKI_RARITY_ORDER.indexOf(value)
    const matches = rows
      .filter((species) => rarity === 'all' || species.rarity === rarity)
      .filter(
        (species) =>
          !needle ||
          [species.commonName, species.commonNameHe, species.scientificName].some((name) =>
            name.toLocaleLowerCase().includes(needle),
          ),
      )
      .sort((a, b) => rank(a.rarity) - rank(b.rarity) || speciesName(a, locale).localeCompare(speciesName(b, locale), locale))
    const chips = [
      { id: 'all' as const, label: t.guide.allRarities, count: rows.length },
      ...WIKI_RARITY_ORDER.map((value) => ({
        id: value,
        label: wikiRarityTitle(value, t.plant),
        count: rows.filter((species) => species.rarity === value).length,
      })).filter((chip) => chip.count > 0),
    ]
    return (
      <Body data-view={view} data-catalog-grid>
        {suggestRow}
        {pendingSection}
        <Tools>
          <Search
            id="catalog-search"
            type="search"
            aria-label={t.guide.search}
            placeholder={t.guide.search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <FilterChips<'all' | PlantRarity> label={t.guide.wiki} options={chips} value={rarity} onChange={setRarity} />
        </Tools>
        {matches.length === 0 ? <Empty>{t.guide.noMatch}</Empty> : null}
        <TileGrid>
          {matches.map((species) => (
            <CatalogTile key={species.id} species={species} onOpen={() => setPreviewId(species.id)} />
          ))}
        </TileGrid>
        {previewId ? <CatalogPreview speciesId={previewId} onClose={() => setPreviewId(null)} /> : null}
        {dialog}
      </Body>
    )
  }

  return (
    <Layout data-view={view}>
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
