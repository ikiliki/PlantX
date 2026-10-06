/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /** App origin when the landing and the app are on separate domains. */
  readonly VITE_APP_URL?: string
  /** Landing origin when the landing and the app are on separate domains. */
  readonly VITE_LANDING_URL?: string
  /** Contact email on the Privacy Policy and Terms. Unset: they say to contact the team through the app. */
  readonly VITE_LEGAL_CONTACT_EMAIL?: string
}
