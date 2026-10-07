import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { canChooseLocale } from '../../i18n/locales'
import { useI18n } from '../../i18n/I18nProvider'
import { catalogSpecies } from '../../features/species/catalogSpecies'
import { groupByRarity, wikiRarityTitle } from '../../features/species/wikiGroups'
import { useStore } from '../../mock/store'
import { isPageNavigable, isPlacementEnabled, type PageId, type PlacementId } from '../../theme/release'
import { Avatar } from '../../components/Avatar/Avatar'
import { CommandPalette, type CommandItem } from '../../components/CommandPalette/CommandPalette'
import { Icon } from '../../components/Icon/Icon'
import { ActivityBell } from '../../features/greenhouse/components/ActivityBell/ActivityBell'
import { publicGrowerName } from '../../features/profile/avatarIcons'
import { ACCOUNT_PARAM, AccountDialog } from '../../features/profile/components/AccountDialog/AccountDialog'
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
  NavIcon,
  NavItem,
  NavItems,
  SearchKey,
  SearchText,
  SearchTrigger,
} from './TopBar.styles'

export function TopBar() {
  const { t, locale } = useI18n()
  const { currentUser, db, signedIn, setLocale } = useStore()
  const tasks = useTaskTabCount()
  const loc = useLocation()
  const navigate = useNavigate()
  const [accountOpen, setAccountOpen] = useState(false)
  const [openNav, setOpenNav] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
  const chooseLocale = canChooseLocale()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Ctrl+K / Cmd+K opens the quick jump from anywhere.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
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
    setSearchOpen(false)
  }, [loc.pathname])

  // `?account=1` (accountHref; the old /settings redirects here) opens the account dialog, then drops the flag.
  useEffect(() => {
    const params = new URLSearchParams(loc.search)
    if (!signedIn || params.get(ACCOUNT_PARAM) !== '1') return
    params.delete(ACCOUNT_PARAM)
    const search = params.toString()
    navigate({ pathname: loc.pathname, search: search ? `?${search}` : '' }, { replace: true, state: loc.state })
    setAccountOpen(true)
  }, [loc.pathname, loc.search, loc.state, navigate, signedIn])

  const pageItems: (CommandItem & { show: boolean })[] = [
    { id: '/home', label: t.nav.home, group: t.nav.pages, icon: 'home', show: show('home') },
    { id: '/market', label: t.nav.market, group: t.nav.pages, icon: 'market', show: show('market') },
    { id: '/greenhouse', label: t.greenhouse.scopeMine, group: t.nav.pages, icon: 'greenhouse', show: show('greenhouse') },
    {
      id: '/greenhouse?scope=global',
      label: t.greenhouse.scopeGlobal,
      group: t.nav.pages,
      icon: 'globe',
      show: show('greenhouse'),
    },
    { id: '/tasks', label: t.nav.todo, group: t.nav.pages, icon: 'drop', show: show('todo') },
    { id: '/rank', label: t.nav.rank, group: t.nav.pages, icon: 'rank', show: show('rank') },
    { id: '/wiki', label: t.nav.wiki, group: t.nav.pages, icon: 'wiki', show: show('wiki') },
  ]
  const searchItems: CommandItem[] = [
    ...pageItems.filter((item) => item.show).map(({ show: _show, ...item }) => item),
    ...(show('wiki')
      ? wikiPlants.map((plant) => ({
          id: `/wiki/${plant.id}`,
          label: plant.label,
          group: t.nav.plants,
          icon: 'greenhouse' as const,
          hint: wikiRarityTitle(plant.rarity, t.plant),
        }))
      : []),
  ]

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
            <NavIcon aria-hidden>
              <Icon name="home" size={18} />
            </NavIcon>
            {t.nav.home}
          </NavItem>
        )}
        {show('market') && (
          <NavItem to="/market" $active={isActive('/market')} aria-current={isActive('/market') ? 'page' : undefined}>
            <NavIcon aria-hidden>
              <Icon name="market" size={18} />
            </NavIcon>
            {t.nav.market}
          </NavItem>
        )}
        {show('greenhouse') && (
          <NavMenu
            label={t.nav.greenhouse}
            icon="greenhouse"
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
            <NavIcon aria-hidden>
              <Icon name="drop" size={18} />
            </NavIcon>
            {tasks.today > 0 ? `${t.nav.todo} (${tasks.today})` : t.nav.todo}
          </NavItem>
        )}
        {show('rank') && (
          <NavItem to="/rank" $active={isActive('/rank')} aria-current={isActive('/rank') ? 'page' : undefined}>
            <NavIcon aria-hidden>
              <Icon name="rank" size={18} />
            </NavIcon>
            {t.nav.rank}
          </NavItem>
        )}
        {show('wiki') && (
          <NavMenu
            label={t.nav.wiki}
            icon="wiki"
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
        <SearchTrigger
          type="button"
          onClick={() => setSearchOpen(true)}
          aria-label={t.nav.search}
          aria-haspopup="dialog"
          aria-expanded={searchOpen}
          aria-keyshortcuts="Control+K Meta+K"
        >
          <Icon name="search" size={18} />
          <SearchText>{t.nav.searchPlaceholder}</SearchText>
          <SearchKey aria-hidden>{isMac ? '⌘K' : 'Ctrl K'}</SearchKey>
        </SearchTrigger>
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
      {searchOpen ? (
        <CommandPalette
          items={searchItems}
          label={t.nav.search}
          placeholder={t.nav.searchPlaceholder}
          emptyText={t.nav.searchEmpty}
          onPick={(item) => {
            setSearchOpen(false)
            navigate(item.id)
          }}
          onClose={() => setSearchOpen(false)}
        />
      ) : null}
    </Bar>
  )
}
