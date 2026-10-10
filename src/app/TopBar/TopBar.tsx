import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import { isPageNavigable, isPlacementEnabled, type PageId, type PlacementId } from '../../theme/release'
import { Avatar } from '../../components/Avatar/Avatar'
import { Icon } from '../../components/Icon/Icon'
import { ActivityBell } from '../../features/greenhouse/components/ActivityBell/ActivityBell'
import { publicGrowerName } from '../../features/profile/avatarIcons'
import { ACCOUNT_PARAM, AccountDialog } from '../../features/profile/components/AccountDialog/AccountDialog'
import { AccountMenu } from '../../features/profile/components/AccountMenu/AccountMenu'
import { useTaskTabCount } from '../../features/todo/useTaskTabCount'
import { useNavMenus } from '../navMenus'
import { NavMenu } from './NavMenu/NavMenu'
import {
  Account,
  Actions,
  AvatarBubble,
  Bar,
  Brand,
  BrandMark,
  LoginButton,
  MobileOnly,
  NavIcon,
  NavItem,
  NavItems,
  TopIcon,
  TopIconButton,
} from './TopBar.styles'

export function TopBar() {
  const { t, locale } = useI18n()
  const { currentUser, db, signedIn } = useStore()
  const tasks = useTaskTabCount()
  const loc = useLocation()
  const navigate = useNavigate()
  const [accountOpen, setAccountOpen] = useState(false)
  // Profile or Settings, opened from the account menu.
  const [accountView, setAccountView] = useState<'profile' | 'settings' | null>(null)
  const [openNav, setOpenNav] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const menus = useNavMenus()

  const pageBoard: Partial<Record<PageId, PlacementId>> = {
    feed: 'feed.board',
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
    setAccountView(null)
    setOpenNav(null)
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
        {show('feed') && (
          <NavItem to="/social" $active={isActive('/social')} aria-current={isActive('/social') ? 'page' : undefined}>
            <NavIcon aria-hidden>
              <Icon name="social" size={18} />
            </NavIcon>
            {t.nav.feed}
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
            items={menus.greenhouse}
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
        {show('market') && (
          <NavItem to="/market" $active={isActive('/market')} aria-current={isActive('/market') ? 'page' : undefined}>
            <NavIcon aria-hidden>
              <Icon name="market" size={18} />
            </NavIcon>
            {t.nav.market}
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
            items={menus.wiki}
          />
        )}
      </NavItems>

      <Actions>
        {/* The phone dock has no room for the catalog; it sits here as an icon. */}
        <MobileOnly>
          {show('wiki') && (
            <TopIcon
              to="/wiki"
              $active={isActive('/wiki')}
              aria-label={t.nav.wiki}
              title={t.nav.wiki}
              aria-current={isActive('/wiki') ? 'page' : undefined}
            >
              <Icon name="wiki" size={20} />
            </TopIcon>
          )}
        </MobileOnly>
        {signedIn && currentUser ? (
          <>
            {/* Your own activity belongs to your greenhouse: the bell shows on that page only. */}
            {loc.pathname === '/greenhouse' ? (
              <MobileOnly>
                <ActivityBell />
              </MobileOnly>
            ) : null}
            <Account>
              <AvatarBubble
                type="button"
                $open={accountOpen}
                aria-label={publicGrowerName(currentUser, locale === 'he')}
                aria-expanded={accountOpen}
                aria-haspopup="dialog"
                onClick={() => setAccountOpen((value) => !value)}
                data-account-trigger
              >
                <Avatar
                  name={publicGrowerName(currentUser, locale === 'he')}
                  color={currentUser.avatarColor}
                  icon={currentUser.avatarIcon}
                  size={38}
                />
              </AvatarBubble>
            </Account>
            {accountOpen && (
              <AccountMenu
                onClose={() => setAccountOpen(false)}
                onProfile={() => {
                  setAccountOpen(false)
                  setAccountView('profile')
                }}
                onSettings={() => {
                  setAccountOpen(false)
                  setAccountView('settings')
                }}
              />
            )}
            {accountView && <AccountDialog view={accountView} onClose={() => setAccountView(null)} />}
          </>
        ) : (
          <>
            {/* Guests have no account card; the gear opens the same dialog with Appearance only. */}
            <TopIconButton
              type="button"
              aria-label={t.nav.settings}
              title={t.nav.settings}
              aria-haspopup="dialog"
              aria-expanded={accountOpen}
              onClick={() => setAccountOpen(true)}
            >
              <Icon name="admin" size={20} />
            </TopIconButton>
            {accountOpen && <AccountDialog onClose={() => setAccountOpen(false)} />}
            <LoginButton to="/login" aria-current={isActive('/login') ? 'page' : undefined}>
              {t.auth.login}
            </LoginButton>
          </>
        )}
      </Actions>
    </Bar>
  )
}
