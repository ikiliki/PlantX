import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { ComponentView } from '../../../../theme/view'
import { speciesName } from '../../../market/categoryData'
import { groupByRarity, wikiRarityTitle } from '../../wikiGroups'
import { wikiHref } from '../GuideLink/GuideLink'
import { WikiCard } from '../WikiCard/WikiCard'
import { WikiSection } from '../WikiSection/WikiSection'
import { WikiToc } from '../WikiToc/WikiToc'
import { Body, Empty, Grid, Layout, TocWrap } from './WikiIndex.styles'

export function WikiIndex({ speciesIds, view = 'page' }: { speciesIds?: string[]; view?: ComponentView }) {
  const { db } = useStore()
  const { t, locale } = useI18n()
  const loc = useLocation()
  const rows = speciesIds ? db.species.filter((item) => speciesIds.includes(item.id)) : db.species
  const groups = groupByRarity(rows).map((group) => ({
    ...group,
    title: wikiRarityTitle(group.rarity, t.plant),
  }))
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((group) => [group.rarity, true])),
  )

  useEffect(() => {
    const hash = loc.hash.replace('#', '')
    if (!hash) return
    setOpen((current) => ({ ...current, [hash]: true }))
    window.requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [loc.hash])

  if (rows.length === 0) {
    return <Empty>{t.guide.empty}</Empty>
  }

  return (
    <Layout>
      {view === 'page' && (
        <TocWrap>
          <WikiToc
            items={groups.map((group) => ({
              id: group.rarity,
              title: group.title,
              href: `/wiki#${group.rarity}`,
              children: group.items.map((species) => ({
                id: species.id,
                title: speciesName(species, locale),
                href: wikiHref(species.id),
              })),
            }))}
          />
        </TocWrap>
      )}
      <Body>
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
    </Layout>
  )
}
