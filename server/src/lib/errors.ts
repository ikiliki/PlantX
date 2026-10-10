/** Domain / HTTP errors. Throw from services and routes — never log here. */

export class AppError extends Error {
  readonly status: number
  /** Stable token returned to clients as `{ error }`. */
  readonly error: string
  /** Extra JSON fields for the client (e.g. the scan quota on a 429). */
  readonly detail?: Record<string, unknown>
  /** Seconds, for a `Retry-After` header. */
  readonly retryAfter?: number

  constructor(
    status: number,
    error: string,
    message?: string,
    extra: { detail?: Record<string, unknown>; retryAfter?: number } = {},
  ) {
    super(message ?? error)
    this.name = 'AppError'
    this.status = status
    this.error = error
    this.detail = extra.detail
    this.retryAfter = extra.retryAfter
  }
}

export const Errors = {
  invalid: (message = 'Invalid request') => new AppError(400, 'invalid', message),
  auth: (message = 'Authentication required') => new AppError(401, 'auth', message),
  forbidden: (message = 'Forbidden') => new AppError(403, 'forbidden', message),
  missing: (message = 'Not found') => new AppError(404, 'missing', message),
  unknown: (message = 'Unknown account') => new AppError(404, 'unknown', message),
  /** Log in with an identity that has no PlantX account: the client switches to Sign up. */
  noAccount: (message = 'No PlantX account yet. Sign up to create one.') => new AppError(404, 'no_account', message),
  exists: (message = 'Already exists') => new AppError(409, 'exists', message),
  /** Signed up and waiting for admin approval. */
  pending: (message = 'Waiting for approval') => new AppError(403, 'pending', message),
  /** Sign-up was declined, or the account is disabled. */
  declined: (message = 'Account cannot sign in') => new AppError(403, 'declined', message),
  internal: (message = 'Internal error') => new AppError(500, 'internal', message),
  /** No AI scans left today (#67). */
  quota: (quota: { remaining: number; resetsAt: string; limit: number; used: number; extra: number }) =>
    new AppError(429, 'quota', 'No AI scans left today', {
      detail: { quota },
      retryAfter: Math.max(1, Math.round((Date.parse(quota.resetsAt) - Date.now()) / 1000)),
    }),
  /** Too many requests in a short window (#57). */
  rateLimited: (retryAfter: number) =>
    new AppError(429, 'rate_limited', 'Too many requests. Try again in a moment.', { retryAfter }),
  /** Upload too big (#57). */
  tooLarge: (message = 'Upload is too large') => new AppError(413, 'too_large', message),
  /** Not an allowed image type (#57). */
  badMedia: (message = 'Only JPEG, PNG or WebP photos') => new AppError(415, 'bad_media', message),
}
