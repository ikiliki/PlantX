function drawJpeg(src: string, max: number, quality: number) {
  return new Promise<string>((resolve) => {
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
    image.onerror = () => resolve(src)
    image.src = src
  })
}

/** Read a photo file as a JPEG data URL, capped at 900px on the long side. */
export function readPhoto(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      void drawJpeg(String(reader.result), 900, 0.72).then(resolve)
    }
    reader.readAsDataURL(file)
  })
}

/** Small JPEG for request history rows. */
export function thumbPhoto(dataUrl: string) {
  return drawJpeg(dataUrl, 160, 0.6)
}
