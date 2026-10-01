import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { AppRoutes } from './app/AppRoutes/AppRoutes'
import { DemoBar } from './app/DemoBar/DemoBar'
import { I18nProvider } from './i18n/I18nProvider'
import { StoreProvider, useStore } from './mock/store'
import { GlobalStyle } from './theme/GlobalStyle'
import { theme } from './theme/tokens'
import { DocumentDirection } from './app/DocumentDirection'
import { AuthProvider } from './features/auth/AuthProvider'
import { SellProvider } from './features/sell/SellProvider'

/** Demo controls only in mock development — not the clean local or prod stacks. */
function DemoBarGate() {
  const { plantxEnv } = useStore()
  if (plantxEnv !== 'mock') return null
  return <DemoBar />
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <StoreProvider>
        <I18nProvider>
          <GlobalStyle />
          <DocumentDirection />
          <BrowserRouter>
            <DemoBarGate />
            <AuthProvider>
              <SellProvider>
                <AppRoutes />
              </SellProvider>
            </AuthProvider>
          </BrowserRouter>
        </I18nProvider>
      </StoreProvider>
    </ThemeProvider>
  )
}
