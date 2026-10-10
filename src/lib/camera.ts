/**
 * Live camera for plant photos. PlantX takes photos only from the camera (no gallery or file picks), so every
 * passport shows the real plant as it is now. A frame is drawn to a canvas, which also drops EXIF (location,
 * device) from the saved photo.
 */

/** Why the camera is not live: refused by the person or browser, no camera here, or it would not start. */
export type CameraProblem = 'denied' | 'unavailable' | 'failed'

/** What the browser already knows: 'prompt' means it will ask. Unknown (old browsers) counts as 'prompt'. */
export async function cameraPermission(): Promise<PermissionState> {
  try {
    const status = await navigator.permissions?.query({ name: 'camera' as PermissionName })
    return status?.state ?? 'prompt'
  } catch {
    return 'prompt'
  }
}

export function cameraSupported() {
  return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia)
}

/** Opens the back camera when there is one. Rejects with a `CameraProblem`. */
export async function startCamera(): Promise<MediaStream> {
  if (!cameraSupported()) throw 'unavailable' satisfies CameraProblem
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 960 } },
    })
  } catch (error) {
    throw cameraProblem(error)
  }
}

function cameraProblem(error: unknown): CameraProblem {
  const name = error instanceof DOMException ? error.name : ''
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'denied'
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'unavailable'
  return 'failed'
}

export function stopCamera(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((track) => track.stop())
}

/** The current frame as a JPEG data URL, at most 900px on the long side (same size as other plant photos). */
export function captureFrame(video: HTMLVideoElement, max = 900, quality = 0.72): string | null {
  const width = video.videoWidth
  const height = video.videoHeight
  if (!width || !height) return null
  const scale = Math.min(1, max / Math.max(width, height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', quality)
}
