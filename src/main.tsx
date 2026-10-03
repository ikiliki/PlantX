import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { registerSW } from 'virtual:pwa-register'
import { siteRole } from './lib/siteUrls'

// The installable app belongs to the app domain; the landing domain never caches its shell.
if (siteRole() !== 'landing') registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
