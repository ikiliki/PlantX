import { catalogSpecies } from '../features/species/catalogSpecies'
import { groupByRarity, wikiRarityTitle } from '../features/species/wikiGroups'
import { useI18n } from '../i18n/I18nProvider'
import { useStore } from '../mock/store'
import type { NavMenuLink } from './TopBar/NavMenu/NavMenu'

/**
 * The sub-pages behind a nav item, shared by the desktop drop-downs (TopBar) and the phone dock's ^ menus,
 * so both always offer the same places.
 */
export function useNavMenus(): { greenhouse: NavMenuLink[]; wiki: NavMenuLink[] } {
  const { t, locale } = useI18n()
  const { db } = useStore()

  const greenhouse: NavMenuLink[] = [
    {
      to: '/greenhouse',
      label: t.greenhouse.myGreenhouse,
      active: (here) => here.pathname === '/greenhouse' && !new URLSearchParams(here.search).has('scope'),
    },
    {
      to: '/greenhouse?scope=global',
      label: t.greenhouse.allGreenhouses,
      active: (here) =>
        (here.pathname === '/greenhouse' && new URLSearchParams(here.search).get('scope') === 'global') ||
        /^\/greenhouse\/[^/]+$/.test(here.pathname),
    },
  ]

  const plants = db.catalog.categories.map((category) => ({
    id: category.speciesId,
    label: locale === 'he' ? category.nameHe : category.name,
    rarity: catalogSpecies(db, category.speciesId)?.rarity ?? 'common',
  }))
  const wiki: NavMenuLink[] = [
    { to: '/wiki', label: `${t.guide.all} (${plants.length})` },
    ...groupByRarity(plants).map((group, index) => ({
      to: `/wiki#${group.rarity}`,
      label: `${wikiRarityTitle(group.rarity, t.plant)} (${group.items.length})`,
      dividerBefore: index === 0,
      children: group.items.map((item) => ({ to: `/wiki/${item.id}`, label: item.label })),
    })),
  ]

  return { greenhouse, wiki }
}
