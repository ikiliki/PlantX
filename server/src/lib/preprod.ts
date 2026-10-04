import { timingSafeEqual } from 'node:crypto'
import { logger } from './logger.ts'

/**
 * PP (every Vercel preview). Test logins for e2e, AI testers and load runs.
 * On only with PLANTX_PREPROD=1 and PLANTX_TEST_TOKEN set, and never on a Vercel production deployment.
 */
export function preprodEnabled() {
  if ((process.env.PLANTX_PREPROD || '').trim() !== '1') return false
  if (process.env.VERCEL_ENV === 'production') {
    logger.error('PLANTX_PREPROD is set on a production deployment; test login stays off')
    return false
  }
  return Boolean(testToken())
}

function testToken() {
  return (process.env.PLANTX_TEST_TOKEN || '').trim()
}

export function checkTestToken(value: string | undefined) {
  const expected = Buffer.from(testToken())
  const given = Buffer.from((value || '').trim())
  return expected.length > 0 && given.length === expected.length && timingSafeEqual(given, expected)
}
