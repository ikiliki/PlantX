import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { AppShell } from './app/AppShell/AppShell'
import { I18nProvider } from './i18n/I18nProvider'
import { StoreProvider } from './mock/store'
import { AdminPage } from './pages/AdminPage/AdminPage'
import { BusinessConsolePage } from './pages/BusinessConsolePage/BusinessConsolePage'
import { ClaimPage } from './pages/ClaimPage/ClaimPage'
import { DemandBoardPage } from './pages/DemandBoardPage/DemandBoardPage'
import { DemandDetailPage } from './pages/DemandDetailPage/DemandDetailPage'
import { DiscoverPage } from './pages/DiscoverPage/DiscoverPage'
import { EventsPage } from './pages/EventsPage/EventsPage'
import { FinancingPage } from './pages/FinancingPage/FinancingPage'
import { GreenhousePage } from './pages/GreenhousePage/GreenhousePage'
import { LoginPage } from './pages/LoginPage/LoginPage'
import { MarketClassPage } from './pages/MarketClassPage/MarketClassPage'
import { MarketPage } from './pages/MarketPage/MarketPage'
import { MessagesPage } from './pages/MessagesPage/MessagesPage'
import { PassportPage } from './pages/PassportPage/PassportPage'
import { SellPage } from './pages/SellPage/SellPage'
import { SellerProfilePage } from './pages/SellerProfilePage/SellerProfilePage'
import { SettingsPage } from './pages/SettingsPage/SettingsPage'
import { GlobalStyle } from './theme/GlobalStyle'
import { theme } from './theme/tokens'
import { DocumentDirection } from './app/DocumentDirection'

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <StoreProvider>
        <I18nProvider>
          <GlobalStyle />
          <DocumentDirection />
          <BrowserRouter>
            <Routes>
              <Route element={<AppShell />}>
                <Route index element={<DiscoverPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="market" element={<MarketPage />} />
                <Route path="market/:id" element={<MarketClassPage />} />
                <Route path="demand" element={<DemandBoardPage />} />
                <Route path="demand/:id" element={<DemandDetailPage />} />
                <Route path="plants/:id" element={<PassportPage />} />
                <Route path="sellers/:id" element={<SellerProfilePage />} />
                <Route path="greenhouse" element={<GreenhousePage />} />
                <Route path="sell" element={<SellPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="business" element={<BusinessConsolePage />} />
                <Route path="events" element={<EventsPage />} />
                <Route path="admin" element={<AdminPage />} />
                <Route path="claim" element={<ClaimPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="future/financing" element={<FinancingPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </I18nProvider>
      </StoreProvider>
    </ThemeProvider>
  )
}
