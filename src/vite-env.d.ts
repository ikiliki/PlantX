/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /** App origin when the landing and the app are on separate domains. */
  readonly VITE_APP_URL?: string
  /** Landing origin when the landing and the app are on separate domains. */
  readonly VITE_LANDING_URL?: string
}
