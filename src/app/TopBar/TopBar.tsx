import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { adminNav } from '../../features/admin/components/AdminTabs/AdminTabs'
import { useI18n } from '../../i18n/I18nProvider'
import { groupByRarity, wikiRarityTitle } from '../../features/species/wikiGroups'
import { categoryName, classDictionary } from '../../mock/classDictionary'
import { useStore } from '../../mock/store'
import { isPageNavigable, isPlacementEnabled, type PageId, type PlacementId } from '../../theme/release'
import { NavMenu } from './NavMenu/NavMenu'
import {
  Account,
  AccountCluster,
  Actions,
  AvatarLink,
  Bar,
  Brand,
  BrandMark,
  Lang,
  LangBtn,
  LoginButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuToggle,
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
  const loc = useLocation()
  const [open, setOpen] = useState(false)
  const [openNav, setOpenNav] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const wikiPlants = classDictionary.map((plant) => {
    const species = db.species.find((item) => item.id === plant.speciesId)
    return {
      id: plant.speciesId,
      label: categoryName(plant, locale),
      rarity: species?.rarity ?? 'common',
    }
  })
  const wikiGroups = groupByRarity(wikiPlants)

  const pageBoard: Partial<Record<PageId, PlacementId>> = {
    market: 'market.board',
    greenhouse: 'greenhouse.board',
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
          <NavItem
            to="/greenhouse"
            $active={isActive('/greenhouse')}
            aria-current={isActive('/greenhouse') ? 'page' : undefined}
          >
            {t.nav.greenhouse}
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
      </NavItems>

      <Actions>
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
        {signedIn && currentUser ? (
          <Account ref={accountRef}>
            <AccountCluster>
              <AvatarLink to="/profile" aria-label={locale === 'he' ? currentUser.nameHe : currentUser.name}>
                {initials(locale === 'he' ? currentUser.nameHe : currentUser.name)}
              </AvatarLink>
              <MenuToggle
                type="button"
                aria-label={t.nav.profile}
                aria-expanded={open}
                aria-haspopup="menu"
                onClick={() => setOpen((value) => !value)}
              >
                ▾
              </MenuToggle>
            </AccountCluster>
            {open && (
              <Menu role="menu">
                <MenuItem to="/profile" role="menuitem" $active={isActive('/profile')}>
                  {t.nav.profile}
                </MenuItem>
                {currentUser.role === 'admin' &&
                  adminNav.map((item) => (
                    <MenuItem key={item.to} to={item.to} role="menuitem" $active={loc.pathname === item.to}>
                      {t.admin[item.id]}
                    </MenuItem>
                  ))}
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
        ) : (
          <LoginButton to="/login" aria-current={isActive('/login') ? 'page' : undefined}>
            {t.auth.login}
          </LoginButton>
        )}
      </Actions>
    </Bar>
  )
}
