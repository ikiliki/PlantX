import type { Context, ErrorHandler, NotFoundHandler } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { AppError, Errors } from '../lib/errors.ts'
import { logger } from '../lib/logger.ts'
import { recordFailure } from '../lib/observability.ts'

function requestMeta(c: Context) {
  const requestId = (c.get as (key: string) => unknown)('requestId') as string | undefined
  return { method: c.req.method, path: c.req.path, requestId }
}

function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err
  // Hono's bodyLimit throws an HTTPException with status 413.
  if (err && typeof err === 'object' && (err as { status?: number }).status === 413) return Errors.tooLarge()
  if (err instanceof SyntaxError) return Errors.invalid('Malformed JSON')
  return Errors.internal(err instanceof Error ? err.message : 'Unexpected error')
}

/** Logs once, maps to `{ error }` JSON. Handlers and services only throw. A 5xx is counted and alerted (#56). */
export const onError: ErrorHandler = async (err, c) => {
  const appError = toAppError(err)
  const meta = requestMeta(c)
  if (appError.status >= 500) {
    logger.error(appError.message, { ...meta, status: appError.status, error: appError.error }, err)
    await recordFailure('server', appError.message, meta)
  } else {
    logger.warn(appError.message, { ...meta, status: appError.status, error: appError.error })
  }
  if (appError.retryAfter) c.header('Retry-After', String(appError.retryAfter))
  return c.json(
    { error: appError.error, message: appError.message.slice(0, 300), ...appError.detail },
    appError.status as ContentfulStatusCode,
  )
}

export const onNotFound: NotFoundHandler = (c) => {
  const err = Errors.missing(`No route ${c.req.method} ${c.req.path}`)
  logger.warn(err.message, { ...requestMeta(c), status: err.status, error: err.error })
  return c.json({ error: err.error }, err.status as ContentfulStatusCode)
}
