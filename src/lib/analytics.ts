import type { AnalyticsEventName } from '../mock/types'

/** The only events the browser may send. Everything else is recorded by the server. */
export const CLIENT_EVENTS = ['landing_view', 'guest_start', 'signup_start', 'plant_add_start'] as const satisfies readonly AnalyticsEventName[]

export type ClientEventName = (typeof CLIENT_EVENTS)[number]

/** The funnel in order, as Admin shows it. */
export const FUNNEL_STEPS: AnalyticsEventName[] = [
  'landing_view',
  'guest_start',
  'signup_start',
  'signup_done',
  'plant_add_start',
  'identify_result',
  'plant_saved',
  'care_done',
  'session_return',
]

/** How far back the Admin funnel looks. */
export const FUNNEL_DAYS = 14
