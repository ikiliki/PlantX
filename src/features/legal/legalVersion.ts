import type { TermsConsent } from '../../mock/types'

/**
 * The current Terms of Use and Privacy Policy, by the date they take effect. Bump it when either text changes
 * in substance: every member is asked to agree again on their next visit. Client and server share it.
 */
export const LEGAL_VERSION = '2026-10-07'

/** A signed-in member who has not agreed to the current version. */
export function needsConsent(user: TermsConsent | null | undefined) {
  return Boolean(user) && user!.termsVersion !== LEGAL_VERSION
}
