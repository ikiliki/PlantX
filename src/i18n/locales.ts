import type { Locale } from '../mock/types'
import { clientEnv } from '../theme/plantxEnv'

/** Languages the dictionaries cover. Hebrew stays even when a build does not offer it. */
export const LOCALES = ['en', 'he'] as const satisfies readonly Locale[]

/**
 * Languages a visitor can pick.
 * QA and production are English only for now. Local mock mode still offers Hebrew,
 * so the Hebrew dictionary and RTL layout stay maintained and checkable.
 * A single entry hides the language toggle.
 */
export function supportedLocales(): Locale[] {
  if (clientEnv() !== 'mock') return ['en']
  return [...LOCALES]
}

export function canChooseLocale() {
  return supportedLocales().length > 1
}

/** Stored Hebrew stays on disk. QA and production still render English until Hebrew is offered again. */
export function activeLocale(stored: Locale): Locale {
  const offered = supportedLocales()
  return offered.includes(stored) ? stored : offered[0]
}
