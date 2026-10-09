import { useCallback, useEffect, useRef } from 'react'
import {
  matchPath,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useNavigationType,
  useParams,
  type Location,
} from 'react-router-dom'
import { HoldNotice } from '../../components/HoldNotice/HoldNotice'
import { LoaderShell } from '../../components/LoaderShell/LoaderShell'
import { NotLaunched } from '../../components/NotLaunched/NotLaunched'
import { AdminGate } from '../../features/admin/components/AdminGate/AdminGate'
import { siteRole } from '../../lib/siteUrls'
import { useStore } from '../../mock/store'
import { admitsWhenClosed } from '../../theme/operator'
import { AppShell } from '../AppShell/AppShell'
import { PageNavigationContext } from '../pageNavigation'
import { PassportDialog } from '../../features/greenhouse/components/PassportDialog/PassportDialog'
import { SellerDialog } from '../../features/sellers/components/SellerDialog/SellerDialog'
import { accountHref } from '../../features/profile/components/AccountDialog/AccountDialog'
import { CategoriesPage } from '../../pages/CategoriesPage/CategoriesPage'
import { CategoryPage } from '../../pages/CategoryPage/CategoryPage'
import { DiscoverPage } from '../../pages/DiscoverPage/DiscoverPage'
import { FeedPage } from '../../pages/FeedPage/FeedPage'
import { GreenhousePage } from '../../pages/GreenhousePage/GreenhousePage'
import { LandingPage } from '../../pages/LandingPage/LandingPage'
import { LandingStillsPage } from '../../pages/LandingStills/LandingStills'
import { LegalPage } from '../../pages/LegalPage/LegalPage'
import { LoginPage } from '../../pages/LoginPage/LoginPage'
import { MarketClassPage } from '../../pages/MarketClassPage/MarketClassPage'
import { MarketPage } from '../../pages/MarketPage/MarketPage'
import { RankPage } from '../../pages/RankPage/RankPage'
import { SellerProfilePage } from '../../pages/SellerProfilePage/SellerProfilePage'
import { ApisPage } from '../../pages/ApisPage/ApisPage'
import { WebhooksPage } from '../../pages/WebhooksPage/WebhooksPage'
import { RequestsPage } from '../../pages/RequestsPage/RequestsPage'
import { ModerationPage } from '../../pages/ModerationPage/ModerationPage'
import { ServerPage } from '../../pages/ServerPage/ServerPage'
import { WikiPage } from '../../pages/WikiPage/WikiPage'
import { TodoPage } from '../../pages/TodoPage/TodoPage'
import { SystemPage } from '../../pages/SystemPage/SystemPage'

function staticLocation(pathname: string): Location {
  return { pathname, search: '', hash: '', state: null, key: pathname }
}

function TodoRedirect() {
  const { todoId } = useParams()
  return <Navigate to={todoId ? `/tasks/${todoId}` : '/tasks'} replace />
}

function PublicGreenhouseRoute() {
  const { ownerId = '' } = useParams()
  return <GreenhousePage ownerId={ownerId} />
}

function ProfileRedirect() {
  const { id = '' } = useParams()
  return <Navigate to={id ? `/greenhouse/${id}` : '/greenhouse'} replace />
}

type SellerState = { sellerFull?: boolean; profilePreview?: string } | null

/** Offline and unlaunched apps paint a full page. Sign-in stays up either way, with no product header. */
function ProductShell() {
  const { currentUser, db, liveStatus } = useStore()
  const { pathname } = useLocation()
  if (pathname === '/login') return <Outlet />
  if (liveStatus === 'loading') return <LoaderShell fill />
  if (liveStatus === 'down') return <HoldNotice mode="maintenance" />
  const open = db.system.launched || admitsWhenClosed(currentUser)
  if (!open) return <NotLaunched />
  return <AppShell />
}

export function AppRoutes() {
  const location = useLocation()
  const navigate = useNavigate()
  const navigationType = useNavigationType()
  const backRef = useRef<Location | null>(null)
  const plantId = matchPath('/plants/:id', location.pathname)?.params.id
  const sellerId = matchPath('/sellers/:id', location.pathname)?.params.id
  const previewState = location.state as SellerState
  const sellerFull = Boolean(previewState?.sellerFull)
  const profilePreview = previewState?.profilePreview
  const overlay = Boolean(plantId || (sellerId && !sellerFull))

  if (!overlay) backRef.current = location
  else backRef.current ??= staticLocation(sellerId ? '/market' : '/greenhouse')
  const background = backRef.current

  const fromGreenhouse = background.pathname === '/greenhouse'

  useEffect(() => {
    if (!plantId || fromGreenhouse) return
    navigate(
      { pathname: background.pathname, search: background.search, hash: background.hash },
      { replace: true, state: background.state },
    )
  }, [plantId, fromGreenhouse, background.pathname, background.search, background.hash, background.state, navigate])

  const closeOverlay = useCallback(() => {
    const back = backRef.current ?? staticLocation('/greenhouse')
    navigate(
      { pathname: back.pathname, search: back.search, hash: back.hash },
      { replace: true, state: back.state },
    )
  }, [navigate])

  return (
    <PageNavigationContext.Provider value={navigationType}>
      <Routes location={overlay ? background : location}>
          {/* The app opens on the greenhouse. The marketing page is /landing, or the root of its own domain. */}
          <Route path="/" element={siteRole() === 'landing' ? <LandingPage /> : <Navigate to="/greenhouse" replace />} />
          <Route path="landing" element={<LandingPage />} />
          <Route path="stills" element={<LandingStillsPage />} />
          <Route path="not-launched" element={<NotLaunched />} />
          {/* Public for everyone, outside the product shell (SURFACE_GUEST.legal = browse). */}
          <Route path="privacy" element={<LegalPage doc="privacy" />} />
          <Route path="terms" element={<LegalPage doc="terms" />} />
        <Route element={<ProductShell />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="home" element={<DiscoverPage />} />
          <Route path="feed" element={<FeedPage />} />
          <Route path="dashboard" element={<Navigate to="/greenhouse" replace />} />
          <Route path="market" element={<MarketPage />} />
          <Route path="market/categories" element={<CategoriesPage />} />
          <Route path="market/categories/:speciesId" element={<CategoryPage />} />
          <Route path="market/:id" element={<MarketClassPage />} />
          <Route path="greenhouse" element={<GreenhousePage />} />
          <Route path="greenhouse/:ownerId" element={<PublicGreenhouseRoute />} />
          <Route path="tasks" element={<TodoPage />} />
          <Route path="tasks/:todoId" element={<TodoPage />} />
          <Route path="todo" element={<Navigate to="/tasks" replace />} />
          <Route path="todo/:todoId" element={<TodoRedirect />} />
          <Route path="rank" element={<RankPage />} />
          <Route path="wiki" element={<WikiPage />} />
          <Route path="wiki/:speciesId" element={<WikiPage />} />
          <Route path="sellers/:id" element={<SellerProfilePage />} />
          <Route path="profile" element={<Navigate to="/greenhouse" replace />} />
          <Route path="profile/:id" element={<ProfileRedirect />} />
          <Route path="settings" element={<Navigate to={accountHref()} replace />} />
        </Route>
        <Route element={<AdminGate />}>
          <Route path="admin" element={<Navigate to="/admin/server" replace />} />
          <Route path="admin/configurations" element={<Navigate to="/admin/server" replace />} />
          <Route path="admin/system" element={<SystemPage />} />
          <Route path="admin/server" element={<ServerPage />} />
          <Route path="admin/requests" element={<RequestsPage />} />
          <Route path="admin/moderation" element={<ModerationPage />} />
          <Route path="admin/apis" element={<ApisPage />} />
          <Route path="admin/webhooks" element={<WebhooksPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/greenhouse" replace />} />
      </Routes>
      {plantId && fromGreenhouse && <PassportDialog plantId={plantId} onClose={closeOverlay} />}
      {sellerId && !sellerFull && <SellerDialog userId={sellerId} onClose={closeOverlay} />}
      {profilePreview && !sellerId && (
        <SellerDialog
          userId={profilePreview}
          onClose={() =>
            navigate(
              { pathname: location.pathname, search: location.search, hash: location.hash },
              { replace: true, state: null },
            )
          }
        />
      )}
    </PageNavigationContext.Provider>
  )
}
