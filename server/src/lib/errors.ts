/** Domain / HTTP errors. Throw from services and routes — never log here. */

export class AppError extends Error {
  readonly status: number
  /** Stable token returned to clients as `{ error }`. */
  readonly error: string

  constructor(status: number, error: string, message?: string) {
    super(message ?? error)
    this.name = 'AppError'
    this.status = status
    this.error = error
  }
}

export const Errors = {
  invalid: (message = 'Invalid request') => new AppError(400, 'invalid', message),
  auth: (message = 'Authentication required') => new AppError(401, 'auth', message),
  forbidden: (message = 'Forbidden') => new AppError(403, 'forbidden', message),
  missing: (message = 'Not found') => new AppError(404, 'missing', message),
  unknown: (message = 'Unknown account') => new AppError(404, 'unknown', message),
  exists: (message = 'Already exists') => new AppError(409, 'exists', message),
  internal: (message = 'Internal error') => new AppError(500, 'internal', message),
}
