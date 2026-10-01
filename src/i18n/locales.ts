import type { Locale } from '../mock/types'
import { clientEnv } from '../theme/plantxEnv'

/** Languages the dictionaries cover. Hebrew stays even when a build does not offer it. */
export const LOCALES = ['en', 'he'] as const satisfies readonly Locale[]

/**
 * Languages a visitor can pick.
 * Production is English only for now. Local and QA still offer Hebrew.
 * A single entry hides the language toggle.
 */
export function supportedLocales(): Locale[] {
  if (clientEnv() === 'prod') return ['en']
  return [...LOCALES]
}

export function canChooseLocale() {
  return supportedLocales().length > 1
}

/** Stored Hebrew stays on disk. Production still renders English until Hebrew is offered again. */
export function activeLocale(stored: Locale): Locale {
  const offered = supportedLocales()
  return offered.includes(stored) ? stored : offered[0]
}
