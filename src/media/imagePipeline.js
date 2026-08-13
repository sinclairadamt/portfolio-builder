const MAX_SOURCE_BYTES = 25 * 1024 * 1024 // 25MB -- guards against pathological phone-camera RAW/HEIC drops
const MAX_DIMENSION = 1920 // long edge, in px -- plenty for a lightbox "large view" without bloating the export
const JPEG_QUALITY = 0.82

export class ImageTooLargeError extends Error {}

// Resizes/recompresses an uploaded image once at ingest time (not at export
// time) so both the local project folder and the exported ZIP stay small.
// createImageBitmap's `imageOrientation: 'from-image'` applies EXIF rotation
// automatically, fixing the classic "phone photo displays sideways" bug, and
// the canvas re-encode incidentally strips EXIF/GPS metadata as a privacy plus.
export async function processImageFile(file, { keepTransparency = false } = {}) {
  if (file.size > MAX_SOURCE_BYTES) {
    throw new ImageTooLargeError(
      `"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)}MB, which is over the 25MB limit`
    )
  }

  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const { width, height } = scaleToFit(bitmap.width, bitmap.height, MAX_DIMENSION)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const mimeType = keepTransparency ? 'image/png' : 'image/jpeg'
  const blob = await canvasToBlob(canvas, mimeType, JPEG_QUALITY)

  return {
    blob,
    mimeType,
    width,
    height,
    sizeBytes: blob.size,
    originalFilename: file.name,
  }
}

// Sequential by design: batches of dropped phone photos process one at a time
// so the tab stays responsive, with onProgress driving a UI indicator.
export async function processImageFiles(files, options = {}, onProgress) {
  const results = []
  for (let index = 0; index < files.length; index++) {
    const file = files[index]
    onProgress?.({ index, total: files.length, filename: file.name })
    try {
      results.push({ file, processed: await processImageFile(file, options) })
    } catch (error) {
      results.push({ file, error })
    }
  }
  return results
}

function scaleToFit(width, height, maxDimension) {
  const longEdge = Math.max(width, height)
  if (longEdge <= maxDimension) return { width, height }
  const scale = maxDimension / longEdge
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas failed to produce an image blob'))),
      type,
      quality
    )
  })
}
