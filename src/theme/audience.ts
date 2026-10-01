/**
 * What a signed-out visitor gets on a surface.
 * `browse` keeps the public screen. `prompt` replaces it with a sign-in view.
 * `hidden` is not available until someone is signed in.
 *
 * Adding a surface here is required: `SURFACE_GUEST` must cover every `AppSurface`.
 */
export const APP_SURFACES = [
  'home',
  'market',
  'greenhouse',
  'rank',
  'wiki',
  'todo',
  'profile',
  'passport',
  'admin',
] as const

export type AppSurface = (typeof APP_SURFACES)[number]

export type GuestAccess = 'browse' | 'prompt' | 'hidden'

export const SURFACE_GUEST: Record<AppSurface, GuestAccess> = {
  home: 'browse',
  market: 'browse',
  greenhouse: 'prompt',
  rank: 'prompt',
  wiki: 'browse',
  todo: 'prompt',
  profile: 'prompt',
  passport: 'browse',
  admin: 'hidden',
}

export interface AudienceViews<T> {
  guest: T
  signedIn: T
}

export function forAudience<T>(signedIn: boolean, views: AudienceViews<T>): T {
  return signedIn ? views.signedIn : views.guest
}
