/**
 * Client-side image helper. Resizes + re-encodes a photo as JPEG so it is small
 * enough to scan and to store with an order (Vercel has no writable disk).
 */
export const MAX_RX_FILE_BYTES = 8 * 1024 * 1024

export function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not open image'))
    img.src = src
  })
}

/** Returns a JPEG data URL, longest side <= maxSide. PDFs are passed through untouched. */
export async function fileToCompressedDataUrl(
  file: File,
  maxSide = 1600,
  quality = 0.78
): Promise<string> {
  if (file.size > MAX_RX_FILE_BYTES) {
    throw new Error('File is too large (max 8MB). Please take a smaller photo.')
  }

  if (file.type === 'application/pdf') {
    if (file.size > 3 * 1024 * 1024) throw new Error('PDF is too large (max 3MB).')
    return readAsDataUrl(file)
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Only photos (JPG, PNG, WEBP) or PDF files are accepted.')
  }

  const original = await readAsDataUrl(file)
  const img = await loadImage(original)

  const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
  const w = Math.max(1, Math.round(img.width * scale))
  const h = Math.max(1, Math.round(img.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return original

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(img, 0, 0, w, h)
  return canvas.toDataURL('image/jpeg', quality)
}
