import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { canChooseLocale } from '../../i18n/locales'
import { useI18n } from '../../i18n/I18nProvider'
import { catalogSpecies } from '../../features/species/catalogSpecies'
import { groupByRarity, wikiRarityTitle } from '../../features/species/wikiGroups'
import { useStore } from '../../mock/store'
import { isOperator } from '../../theme/operator'
import { isPageNavigable, isPlacementEnabled, type PageId, type PlacementId } from '../../theme/release'
import { ActivityBell } from '../../features/greenhouse/components/ActivityBell/ActivityBell'
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
  Menu,
  MobileOnly,
  MenuButton,
  MenuItem,
  MenuLang,
  NavItem,
  NavItems,
} from './TopBar.styles'

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function TopBar() {
  const { t, locale } = useI18n()
  const { currentUser, db, signedIn, loginAs, setLocale } = useStore()
  const taskCount = useTaskTabCount()
  const loc = useLocation()
  const [open, setOpen] = useState(false)
  const [openNav, setOpenNav] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)
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
    setOpen(false)
    setOpenNav(null)
  }, [loc.pathname, loc.search])

  useEffect(() => {
    if (!open) return
    setOpenNav(null)
    const onPointer = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

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
      <Brand to="/home">
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
            {taskCount > 0 ? `${t.nav.todo} (${taskCount})` : t.nav.todo}
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
              { to: '/wiki', label: t.guide.all },
              ...wikiGroups.map((group, index) => ({
                to: `/wiki#${group.rarity}`,
                label: wikiRarityTitle(group.rarity, t.plant),
                dividerBefore: index === 0,
                children: group.items.map((item) => ({
                  to: `/wiki/${item.id}`,
                  label: item.label,
                })),
              })),
            ]}
          />
        )}
        {isOperator(currentUser) && (
          <NavItem to="/admin/server" $active={isActive('/admin')} aria-current={isActive('/admin') ? 'page' : undefined}>
            {t.admin.title}
          </NavItem>
        )}
      </NavItems>

      <Actions>
        {signedIn && currentUser ? (
          <>
            <MobileOnly>
              <ActivityBell />
            </MobileOnly>
            <Account ref={accountRef}>
              <AvatarBubble
                type="button"
                $open={open}
                aria-label={locale === 'he' ? currentUser.nameHe : currentUser.name}
                aria-expanded={open}
                aria-haspopup="menu"
                onClick={() => setOpen((value) => !value)}
              >
                {initials(locale === 'he' ? currentUser.nameHe : currentUser.name)}
              </AvatarBubble>
              {open && (
                <Menu role="menu">
                  <MenuItem to="/profile" role="menuitem" $active={isActive('/profile')} onClick={() => setOpen(false)}>
                    {t.nav.profile}
                  </MenuItem>
                  {chooseLocale && (
                    <MenuLang>
                      <span>{t.nav.language}</span>
                      {langToggle}
                    </MenuLang>
                  )}
                  <MenuButton
                    type="button"
                    role="menuitem"
                    $split
                    onClick={() => {
                      setOpen(false)
                      loginAs(null)
                    }}
                  >
                    {t.profile.signOut}
                  </MenuButton>
                </Menu>
              )}
            </Account>
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
