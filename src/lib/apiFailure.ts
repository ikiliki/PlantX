/** Why a live request failed. The admin page shows this instead of demo rows. */
export type ApiFailure = {
  /** HTTP status. `0` when the request never completed. */
  status: number
  /** `timeout`, `offline`, `html`, or the API `error` token. */
  error: string
  /** Server message, or a short snippet of a non-JSON body. */
  message?: string
}

export type ApiOutcome<T> = { ok: true; data: T } | { ok: false; failure: ApiFailure }

const SNIP = 180

function clip(text: string) {
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, SNIP)
}

export async function failureFromResponse(res: Response): Promise<ApiFailure> {
  const type = res.headers.get('content-type') ?? ''
  const raw = await res.text().catch(() => '')
  const text = clip(raw)
  const looksHtml = type.includes('html') || /^<!doctype html/i.test(text) || text.startsWith('<html')
  if (!type.includes('json')) {
    return { status: res.status, error: looksHtml ? 'html' : 'http', message: text || undefined }
  }
  try {
    const body = JSON.parse(raw) as { error?: unknown; message?: unknown }
    const error = typeof body.error === 'string' && body.error ? body.error : 'http'
    const message = typeof body.message === 'string' ? clip(body.message) : undefined
    return { status: res.status, error, message: message || undefined }
  } catch {
    return { status: res.status, error: 'http', message: text || undefined }
  }
}

export function failureFromThrow(err: unknown): ApiFailure {
  if (err instanceof DOMException && err.name === 'AbortError') return { status: 0, error: 'timeout' }
  return { status: 0, error: 'offline' }
}

type FailureCopy = {
  serverDownBody: string
  serverFailTimeout: string
  serverFailOffline: string
  serverFailHtml: string
  serverFailHttp: string
  serverFailDown: string
  serverFailMessage: string
}

/** One sentence an operator can read. Server text is kept as returned. */
export function formatApiFailure(failure: ApiFailure | null, copy: FailureCopy) {
  if (!failure) return copy.serverDownBody
  if (failure.error === 'timeout') return copy.serverFailTimeout
  if (failure.error === 'offline') return copy.serverFailOffline
  const status = String(failure.status)
  const message = failure.message ?? ''
  if (failure.error === 'html') {
    const line = copy.serverFailHtml.replace('{status}', status)
    return message ? `${line} ${message}` : line
  }
  if ((failure.status === 502 || failure.status === 503 || failure.status === 504) && !message) {
    return copy.serverFailDown.replace('{status}', status)
  }
  if (message && message !== failure.error) {
    return copy.serverFailMessage
      .replace('{status}', status)
      .replace('{error}', failure.error)
      .replace('{message}', message)
  }
  const token = failure.error === 'http' ? '' : ` ${failure.error}`
  return copy.serverFailHttp.replace('{status}', status).replace('{error}', token)
}
