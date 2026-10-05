import { Errors } from './errors.ts'

/**
 * Upload checks (#57). Photos arrive as data URLs. Only JPEG, PNG and WebP are accepted, the bytes must
 * really be that type (magic numbers, not just the declared mime), and the decoded size is capped.
 * Site paths ('/class-photos/…') and https URLs are references, not uploads, and pass through.
 * The cap stays under Vercel's 4.5 MB function body limit.
 */
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024

const KINDS = {
  'image/jpeg': (b: Buffer) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b: Buffer) =>
    b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a,
  'image/webp': (b: Buffer) =>
    b.length > 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP',
} as const

type Mime = keyof typeof KINDS

/** Throws 413 / 415 for a bad upload. Returns the value unchanged when it is fine. */
export function assertPhoto(value: string, maxBytes = MAX_PHOTO_BYTES) {
  if (value.startsWith('/') && !value.startsWith('//')) return value
  if (value.startsWith('https://')) return value
  const match = value.match(/^data:([a-z/+.-]+);base64,(.*)$/s)
  if (!match) throw Errors.badMedia()
  const mime = match[1] === 'image/jpg' ? 'image/jpeg' : match[1]
  if (!(mime in KINDS)) throw Errors.badMedia()
  const base64 = match[2].replace(/\s/g, '')
  if (Math.floor((base64.length * 3) / 4) > maxBytes) {
    throw Errors.tooLarge(`Photos can be up to ${Math.round(maxBytes / 1024 / 1024)} MB`)
  }
  const head = Buffer.from(base64.slice(0, 64), 'base64')
  if (!KINDS[mime as Mime](head)) throw Errors.badMedia('The photo is not a real JPEG, PNG or WebP image')
  return value
}

export function assertPhotos(values: unknown, maxBytes = MAX_PHOTO_BYTES) {
  if (values == null) return
  if (!Array.isArray(values)) throw Errors.invalid('photos must be a list')
  for (const value of values) {
    if (typeof value !== 'string') throw Errors.badMedia()
    if (value) assertPhoto(value, maxBytes)
  }
}
