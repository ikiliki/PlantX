import { useLayoutEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigationType } from 'react-router-dom'
import { Icon, type IconName } from '../../components/Icon/Icon'
import { LoaderShell } from '../../components/LoaderShell/LoaderShell'
import { LiveBanner } from '../../components/LiveBanner/LiveBanner'
import { ScrollTopButton } from '../../components/ScrollTopButton/ScrollTopButton'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import { isPageNavigable, isPlacementEnabled, type PageId, type PlacementId } from '../../theme/release'
import { theme } from '../../theme/tokens'
import { TopBar } from '../TopBar/TopBar'
import { BottomIcon, BottomLink, BottomNav, Main, Shell } from './AppShell.styles'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Class-to-class moves stay on the market page; only the class data should change. */
function isMarketClassPath(path: string) {
  return /^\/market\/(?!categories(?:\/|$))[^/]+$/.test(path)
}

export function AppShell() {
  const { t } = useI18n()
  const { db } = useStore()
  const loc = useLocation()
  const navType = useNavigationType()
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

  const bottom = (
    [
      { to: '/home', label: t.nav.home, icon: 'home' as const, pageId: 'home' as const },
      { to: '/market', label: t.nav.market, icon: 'market' as const, pageId: 'market' as const },
      { to: '/greenhouse', label: t.nav.greenhouse, icon: 'greenhouse' as const, pageId: 'greenhouse' as const },
      { to: '/rank', label: t.nav.rank, icon: 'rank' as const, pageId: 'rank' as const },
      { to: '/wiki', label: t.nav.wiki, icon: 'wiki' as const, pageId: 'wiki' as const },
    ] satisfies { to: string; label: string; icon: IconName; pageId: PageId }[]
  ).filter((item) => {
    if (!isPageNavigable(db.system, item.pageId)) return false
    const board: Partial<Record<PageId, PlacementId>> = {
      market: 'market.board',
      greenhouse: 'greenhouse.board',
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
        <LoaderShell>
          <Outlet />
        </LoaderShell>
      </Main>
      <ScrollTopButton label={t.common.backToTop} />
      <BottomNav>
        {bottom.map((l) => {
          const active = loc.pathname === l.to || (l.to !== '/' && loc.pathname.startsWith(l.to))
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
