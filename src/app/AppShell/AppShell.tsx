import { useLayoutEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Icon, type IconName } from '../../components/Icon/Icon'
import { LoaderShell } from '../../components/LoaderShell/LoaderShell'
import { LiveBanner } from '../../components/LiveBanner/LiveBanner'
import { PullToRefresh } from '../../components/PullToRefresh/PullToRefresh'
import { ScrollTopButton } from '../../components/ScrollTopButton/ScrollTopButton'
import { useTaskTabCount } from '../../features/todo/useTaskTabCount'
import { useI18n } from '../../i18n/I18nProvider'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { useStore } from '../../mock/store'
import { isPageNavigable, isPlacementEnabled, type PageId, type PlacementId } from '../../theme/release'
import { theme } from '../../theme/tokens'
import { TopBar } from '../TopBar/TopBar'
import { useDockAway } from '../dockState'
import { usePageRefresh } from '../usePageRefresh'
import { usePageNavigationType } from '../pageNavigation'
import { BottomIcon, BottomLink, BottomNav, Main, Shell } from './AppShell.styles'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Class-to-class moves stay on the market page; only the class data should change. */
function isMarketClassPath(path: string) {
  return /^\/market\/(?!categories(?:\/|$))[^/]+$/.test(path)
}

/** Plant passport and seller card open over the current page. */
function isOverlayPath(path: string) {
  return /^\/plants\/[^/]+$/.test(path) || /^\/sellers\/[^/]+$/.test(path)
}

export function AppShell() {
  const { t } = useI18n()
  const { db, currentUser } = useStore()
  const tasks = useTaskTabCount()
  const loc = useLocation()
  // Not useNavigationType(): under <Routes location> it always says POP, and nothing would scroll to the top.
  const navType = usePageNavigationType()
  const dockAway = useDockAway()
  // Phone: pull to refresh on Market, Greenhouse, Tasks and Catalog (Home has its own in the feed).
  const phone = useMediaQuery('(max-width: 899px)')
  const pageRefresh = usePageRefresh(loc.pathname)
  const mainRef = useRef<HTMLElement>(null)
  const firstRender = useRef(true)
  const pathRef = useRef(loc.pathname)

  useLayoutEffect(() => {
    const previous = pathRef.current
    pathRef.current = loc.pathname
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (isMarketClassPath(previous) && isMarketClassPath(loc.pathname)) return
    if (isOverlayPath(previous) || isOverlayPath(loc.pathname)) return
    if (navType !== 'POP') window.scrollTo({ top: 0, behavior: 'instant' })
    if (reducedMotion()) return
    mainRef.current?.animate(
      [
        { opacity: 0, transform: 'translateY(10px)' },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 320, easing: theme.motion.ease },
    )
  }, [loc.pathname, navType])

  const bottom: { to: string; label: string; icon: IconName; pageId?: PageId }[] = (
    [
      { to: '/home', label: t.nav.home, icon: 'home' as const, pageId: 'home' as const },
      { to: '/market', label: t.nav.market, icon: 'market' as const, pageId: 'market' as const },
      { to: '/greenhouse', label: t.nav.greenhouse, icon: 'greenhouse' as const, pageId: 'greenhouse' as const },
      {
        to: '/tasks',
        label: tasks.today > 0 ? `${t.nav.todo} (${tasks.today})` : t.nav.todo,
        icon: 'drop' as const,
        pageId: 'todo' as const,
      },
      { to: '/rank', label: t.nav.rank, icon: 'rank' as const, pageId: 'rank' as const },
      { to: '/wiki', label: t.nav.wiki, icon: 'wiki' as const, pageId: 'wiki' as const },
    ] satisfies { to: string; label: string; icon: IconName; pageId: PageId }[]
  ).filter((item) => {
    if (!item.pageId || !isPageNavigable(db.system, item.pageId)) return false
    const board: Partial<Record<PageId, PlacementId>> = {
      market: 'market.board',
      greenhouse: 'greenhouse.board',
      todo: 'todo.board',
      rank: 'rank.board',
      wiki: 'wiki.board',
    }
    const id = board[item.pageId]
    return !id || isPlacementEnabled(db.system, id)
  })


  return (
    <Shell>
      <TopBar />
      <LiveBanner />
      <Main ref={mainRef} $wide={loc.pathname === '/home'}>
        <PullToRefresh
          enabled={phone && pageRefresh.available}
          busy={pageRefresh.refreshing}
          label={t.feed.refreshing}
          onRefresh={pageRefresh.refresh}
        />
        <LoaderShell>
          <Outlet />
        </LoaderShell>
      </Main>
      <ScrollTopButton label={t.common.backToTop} dock />
      <BottomNav $cols={bottom.length} $away={dockAway} data-dock={dockAway ? 'away' : 'shown'}>
        {bottom.map((l) => {
          const active = l.to.startsWith('/admin')
            ? loc.pathname.startsWith('/admin')
            : loc.pathname === l.to || (l.to !== '/' && loc.pathname.startsWith(l.to))
          return (
            <BottomLink key={l.to} to={l.to} $active={active} aria-current={active ? 'page' : undefined}>
              <BottomIcon $active={active}>
                <Icon name={l.icon} />
              </BottomIcon>
              {l.label}
            </BottomLink>
          )
        })}
      </BottomNav>
    </Shell>
  )
}
