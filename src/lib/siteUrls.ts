/**
 * The marketing landing and the app can live on two domains (`VITE_LANDING_URL`, `VITE_APP_URL`).
 * When either is unset (dev, QA, previews) one host serves both and the landing stays at `/landing`.
 */
export type SiteRole = 'app' | 'landing' | 'both'

const APP_URL = origin(import.meta.env.VITE_APP_URL)
const LANDING_URL = origin(import.meta.env.VITE_LANDING_URL)

function origin(raw: unknown) {
  try {
    return raw ? new URL(String(raw)).origin : ''
  } catch {
    return ''
  }
}

export function siteRole(host = window.location.host): SiteRole {
  if (!APP_URL || !LANDING_URL) return 'both'
  if (host === new URL(LANDING_URL).host) return 'landing'
  if (host === new URL(APP_URL).host) return 'app'
  return 'both'
}

/** An app path, absolute when we are on the landing domain. */
export function appHref(path: string) {
  return siteRole() === 'landing' ? `${APP_URL}${path}` : path
}

/** The marketing page: `/landing` on a shared host, the landing domain's root otherwise. */
export function landingHref() {
  const role = siteRole()
  if (role === 'app') return `${LANDING_URL}/`
  return role === 'landing' ? '/' : '/landing'
}
