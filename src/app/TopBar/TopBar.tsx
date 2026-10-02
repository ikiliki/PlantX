import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { canChooseLocale } from '../../i18n/locales'
import { useI18n } from '../../i18n/I18nProvider'
import { catalogSpecies } from '../../features/species/catalogSpecies'
import { groupByRarity, wikiRarityTitle } from '../../features/species/wikiGroups'
import { useStore } from '../../mock/store'
import { isPageNavigable, isPlacementEnabled, type PageId, type PlacementId } from '../../theme/release'
import { Avatar } from '../../components/Avatar/Avatar'
import { ActivityBell } from '../../features/greenhouse/components/ActivityBell/ActivityBell'
import { publicGrowerName } from '../../features/profile/avatarIcons'
import { AccountDialog } from '../../features/profile/components/AccountDialog/AccountDialog'
import { useTaskTabCount } from '../../features/todo/useTaskTabCount'
import { NavMenu } from './NavMenu/NavMenu'
import {
  Account,
  Actions,
  AvatarBubble,
  Bar,
  Brand,
  BrandMark,
  Lang,
  LangBtn,
  LoginButton,
  MobileOnly,
  NavItem,
  NavItems,
} from './TopBar.styles'

export function TopBar() {
  const { t, locale } = useI18n()
  const { currentUser, db, signedIn, setLocale } = useStore()
  const tasks = useTaskTabCount()
  const loc = useLocation()
  const [accountOpen, setAccountOpen] = useState(false)
  const [openNav, setOpenNav] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const chooseLocale = canChooseLocale()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const wikiPlants = db.catalog.categories.map((category) => {
    const species = catalogSpecies(db, category.speciesId)
    return {
      id: category.speciesId,
      label: locale === 'he' ? category.nameHe : category.name,
      rarity: species?.rarity ?? 'common',
    }
  })
  const wikiGroups = groupByRarity(wikiPlants)

  const pageBoard: Partial<Record<PageId, PlacementId>> = {
    market: 'market.board',
    greenhouse: 'greenhouse.board',
    todo: 'todo.board',
    rank: 'rank.board',
    wiki: 'wiki.board',
  }
  const show = (pageId: PageId) => {
    if (!isPageNavigable(db.system, pageId)) return false
    const board = pageBoard[pageId]
    return !board || isPlacementEnabled(db.system, board)
  }

  const isActive = (to: string) =>
    loc.pathname === to || (to !== '/' && loc.pathname.startsWith(to))

  useEffect(() => {
    setAccountOpen(false)
    setOpenNav(null)
  }, [loc.pathname, loc.search])

  const langToggle = (
    <Lang role="group" aria-label={t.nav.language}>
      <LangBtn
        type="button"
        $on={locale === 'he'}
        aria-pressed={locale === 'he'}
        onClick={() => setLocale('he')}
      >
        {t.landing.langHe}
      </LangBtn>
      <LangBtn
        type="button"
        $on={locale === 'en'}
        aria-pressed={locale === 'en'}
        onClick={() => setLocale('en')}
      >
        {t.landing.langEn}
      </LangBtn>
    </Lang>
  )

  return (
    <Bar $scrolled={scrolled}>
      <Brand to="/greenhouse">
        <BrandMark src="/icons/brand-mark.svg" alt="" width={30} height={30} />
        {t.appName}
      </Brand>

      <NavItems>
        {show('home') && (
          <NavItem to="/home" $active={isActive('/home')} aria-current={isActive('/home') ? 'page' : undefined}>
            {t.nav.home}
          </NavItem>
        )}
        {show('market') && (
          <NavItem to="/market" $active={isActive('/market')} aria-current={isActive('/market') ? 'page' : undefined}>
            {t.nav.market}
          </NavItem>
        )}
        {show('greenhouse') && (
          <NavMenu
            label={t.nav.greenhouse}
            to="/greenhouse"
            open={openNav === 'greenhouse'}
            onOpen={() => setOpenNav('greenhouse')}
            onClose={() => setOpenNav((current) => (current === 'greenhouse' ? null : current))}
            items={[
              {
                to: '/greenhouse',
                label: t.greenhouse.scopeMine,
                active: (here) => here.pathname === '/greenhouse' && !new URLSearchParams(here.search).has('scope'),
              },
              {
                to: '/greenhouse?scope=global',
                label: t.greenhouse.scopeGlobal,
                active: (here) =>
                  here.pathname === '/greenhouse' && new URLSearchParams(here.search).get('scope') === 'global',
              },
            ]}
          />
        )}
        {show('todo') && (
          <NavItem to="/tasks" $active={isActive('/tasks')} aria-current={isActive('/tasks') ? 'page' : undefined}>
            {tasks.today > 0 ? `${t.nav.todo} (${tasks.today})` : t.nav.todo}
          </NavItem>
        )}
        {show('rank') && (
          <NavItem to="/rank" $active={isActive('/rank')} aria-current={isActive('/rank') ? 'page' : undefined}>
            {t.nav.rank}
          </NavItem>
        )}
        {show('wiki') && (
          <NavMenu
            label={t.nav.wiki}
            to="/wiki"
            open={openNav === 'wiki'}
            onOpen={() => setOpenNav('wiki')}
            onClose={() => setOpenNav((current) => (current === 'wiki' ? null : current))}
            items={[
              { to: '/wiki', label: `${t.guide.all} (${wikiPlants.length})` },
              ...wikiGroups.map((group, index) => ({
                to: `/wiki#${group.rarity}`,
                label: `${wikiRarityTitle(group.rarity, t.plant)} (${group.items.length})`,
                dividerBefore: index === 0,
                children: group.items.map((item) => ({
                  to: `/wiki/${item.id}`,
                  label: item.label,
                })),
              })),
            ]}
          />
        )}
      </NavItems>

      <Actions>
        {signedIn && currentUser ? (
          <>
            <MobileOnly>
              <ActivityBell />
            </MobileOnly>
            <Account>
              <AvatarBubble
                type="button"
                $open={accountOpen}
                aria-label={publicGrowerName(currentUser, locale === 'he')}
                aria-expanded={accountOpen}
                aria-haspopup="dialog"
                onClick={() => setAccountOpen((value) => !value)}
              >
                <Avatar
                  name={publicGrowerName(currentUser, locale === 'he')}
                  color={currentUser.avatarColor}
                  icon={currentUser.avatarIcon}
                  size={38}
                />
              </AvatarBubble>
            </Account>
            {accountOpen && <AccountDialog onClose={() => setAccountOpen(false)} />}
          </>
        ) : (
          <>
            {chooseLocale && langToggle}
            <LoginButton to="/login" aria-current={isActive('/login') ? 'page' : undefined}>
              {t.auth.login}
            </LoginButton>
          </>
        )}
      </Actions>
    </Bar>
  )
}
