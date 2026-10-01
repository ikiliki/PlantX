import type { ErrorHandler, NotFoundHandler } from 'hono'
import { AppError, Errors } from '../lib/errors.ts'
import { logger } from '../lib/logger.ts'

function requestMeta(c: { req: { method: string; path: string } }) {
  return { method: c.req.method, path: c.req.path }
}

function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err
  if (err instanceof SyntaxError) return Errors.invalid('Malformed JSON')
  return Errors.internal(err instanceof Error ? err.message : 'Unexpected error')
}

/** Logs once, maps to `{ error }` JSON. Handlers and services only throw. */
export const onError: ErrorHandler = (err, c) => {
  const appError = toAppError(err)
  logger.error(appError.message, { ...requestMeta(c), status: appError.status, error: appError.error }, err)
  return c.json({ error: appError.error, message: appError.message.slice(0, 300) }, appError.status)
}

export const onNotFound: NotFoundHandler = (c) => {
  const err = Errors.missing(`No route ${c.req.method} ${c.req.path}`)
  logger.error(err.message, { ...requestMeta(c), status: err.status, error: err.error }, err)
  return c.json({ error: err.error }, err.status)
}
