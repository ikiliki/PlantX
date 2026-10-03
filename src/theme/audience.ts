/**
 * What a signed-out visitor gets on a surface.
 * `browse` keeps the public screen. `prompt` keeps the page chrome and replaces the data with
 * `GuestView` (a log-in message). `hidden` is not available until someone is signed in.
 *
 * Adding a surface here is required: `SURFACE_GUEST` must cover every `AppSurface`.
 */
export const APP_SURFACES = [
  'home',
  'market',
  'greenhouse',
  /** The Global tab and a grower's public greenhouse (`/greenhouse/:ownerId`). */
  'greenhouseGlobal',
  'rank',
  'wiki',
  'todo',
  'passport',
  'admin',
] as const

export type AppSurface = (typeof APP_SURFACES)[number]

export type GuestAccess = 'browse' | 'prompt' | 'hidden'

export const SURFACE_GUEST: Record<AppSurface, GuestAccess> = {
  home: 'prompt',
  market: 'browse',
  greenhouse: 'prompt',
  greenhouseGlobal: 'prompt',
  rank: 'prompt',
  wiki: 'browse',
  todo: 'prompt',
  passport: 'prompt',
  admin: 'hidden',
}

export interface AudienceViews<T> {
  guest: T
  signedIn: T
}

export function forAudience<T>(signedIn: boolean, views: AudienceViews<T>): T {
  return signedIn ? views.signedIn : views.guest
}
