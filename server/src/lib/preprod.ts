import { logger } from './logger.ts'

/**
 * PP (every Vercel preview): email + password sign-in, the PP badge, mock identify.
 * On only with PLANTX_PREPROD=1, and never on a Vercel production deployment.
 */
export function preprodEnabled() {
  if ((process.env.PLANTX_PREPROD || '').trim() !== '1') return false
  if (process.env.VERCEL_ENV === 'production') {
    logger.error('PLANTX_PREPROD is set on a production deployment; PP sign-in stays off')
    return false
  }
  return true
}
