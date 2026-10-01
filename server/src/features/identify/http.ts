import { IDENTIFY_TIMEOUT_MS } from './types.ts'

export class IdentifyTimeoutError extends Error {
  constructor(message = 'Provider timed out') {
    super(message)
    this.name = 'IdentifyTimeoutError'
  }
}

/** Strip `data:image/...;base64,` so providers get bare base64. */
export function stripDataUrl(image: string): { mime: string; base64: string } {
  const match = /^data:([^;]+);base64,(.+)$/i.exec(image.trim())
  if (match) return { mime: match[1], base64: match[2] }
  if (/^[A-Za-z0-9+/=\s]+$/.test(image) && image.length > 64) {
    return { mime: 'image/jpeg', base64: image.replace(/\s/g, '') }
  }
  throw new Error('Expected a base64 image data URL')
}

export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = IDENTIFY_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new IdentifyTimeoutError()
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

export function parseCultivar(scientificName: string): string | undefined {
  const quoted =
    /['\u2018\u2019]([^'\u2018\u2019]+)['\u2018\u2019]/.exec(scientificName) ||
    /"([^"]+)"/.exec(scientificName)
  if (quoted?.[1]) return quoted[1].trim()
  const cv = /\bcv\.?\s+([A-Za-z0-9][\w-]*)/i.exec(scientificName)
  if (cv?.[1]) return cv[1].trim()
  return undefined
}

export function genusFromScientific(scientificName: string): string | undefined {
  const first = scientificName.trim().split(/\s+/)[0]
  return first || undefined
}
