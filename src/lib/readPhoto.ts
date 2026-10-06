/**
 * The browser picked a photo it cannot decode (most often HEIC from a phone camera's "High efficiency
 * pictures" setting: Chrome lists those files but cannot show them). `format` is what the file says it is.
 */
export class UnreadablePhotoError extends Error {
  constructor(readonly format: string) {
    super(`The browser cannot read this ${format} photo`)
    this.name = 'UnreadablePhotoError'
  }
}

/** A short format name for the message: HEIC, TIFF, … from the file type or, failing that, the extension. */
export function photoFormat(file: Pick<File, 'type' | 'name'>) {
  const fromType = file.type.split('/')[1]?.replace(/^x-/, '')
  const fromName = file.name.includes('.') ? file.name.split('.').pop() : ''
  const raw = (fromType || fromName || 'unknown').toLowerCase()
  return raw === 'heif' ? 'HEIC' : raw.toUpperCase()
}

/** Draws `src` as a JPEG of at most `max` px on the long side. Resolves null when the image cannot be decoded. */
function drawJpeg(src: string, max: number, quality: number) {
  return new Promise<string | null>((resolve) => {
    const image = new Image()
    image.onload = () => {
      const scale = Math.min(1, max / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(image.width * scale)
      canvas.height = Math.round(image.height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(src)
        return
      }
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    image.onerror = () => resolve(null)
    image.src = src
  })
}

/**
 * Read a photo file as a JPEG data URL, capped at 900px on the long side. Rejects with
 * `UnreadablePhotoError` when the browser cannot decode it, so a broken file is never shown or sent.
 */
export function readPhoto(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      void drawJpeg(String(reader.result), 900, 0.72).then((jpeg) =>
        jpeg ? resolve(jpeg) : reject(new UnreadablePhotoError(photoFormat(file))),
      )
    }
    reader.readAsDataURL(file)
  })
}

/** Small JPEG for request history rows. Falls back to the photo itself. */
export async function thumbPhoto(dataUrl: string) {
  return (await drawJpeg(dataUrl, 160, 0.6)) ?? dataUrl
}
