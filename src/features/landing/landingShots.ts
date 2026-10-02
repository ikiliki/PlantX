/**
 * Real app stills in `public/landing/`, captured from mock mode (persona Maya).
 * Re-shoot them when a screen changes; the landing never mounts a live page.
 */
export const landingShots = {
  homeDesk: '/landing/home-desk.jpg',
  homePhone: '/landing/home-phone.jpg',
  greenhouseDesk: '/landing/greenhouse-desk.jpg',
  greenhousePhone: '/landing/greenhouse-phone.jpg',
  passportDesk: '/landing/passport-desk.jpg',
  passportPhone: '/landing/passport-phone.jpg',
  tasksDesk: '/landing/tasks-desk.jpg',
  tasksPhone: '/landing/tasks-phone.jpg',
  wikiDesk: '/landing/wiki-desk.jpg',
  aiPhoto: '/landing/ai-photo.jpg',
  aiScan: '/landing/ai-scan.jpg',
  aiIdentity: '/landing/ai-identity.jpg',
  aiReview: '/landing/ai-review.jpg',
} as const

export type LandingDevice = 'desk' | 'phone'
