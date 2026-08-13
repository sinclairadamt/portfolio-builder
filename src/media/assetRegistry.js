import { createId } from '../data/schema.js'
import { processImageFile } from './imagePipeline.js'

const EXTENSION_BY_MIME = { 'image/jpeg': 'jpg', 'image/png': 'png' }

// Processes an uploaded image (resize/compress/orientation-fix), writes the
// result to the active ProjectStore, and registers it in project.assets.
// Returns the new assetId; callers wire that id into about.photoAssetId,
// a media item's assetId, etc.
export async function ingestImageAsset(store, project, file, options = {}) {
  const processed = await processImageFile(file, options)
  const assetId = createId('asset')
  const extension = EXTENSION_BY_MIME[processed.mimeType] ?? 'bin'
  const storedFilename = `${assetId}.${extension}`

  await store.writeAsset(storedFilename, processed.blob)

  project.assets[assetId] = {
    id: assetId,
    originalFilename: processed.originalFilename,
    storedFilename,
    mimeType: processed.mimeType,
    width: processed.width,
    height: processed.height,
    sizeBytes: processed.sizeBytes,
    createdAt: new Date().toISOString(),
  }

  return assetId
}

export async function ingestImageAssets(store, project, files, options = {}, onProgress) {
  const assetIds = []
  for (let index = 0; index < files.length; index++) {
    onProgress?.({ index, total: files.length, filename: files[index].name })
    assetIds.push(await ingestImageAsset(store, project, files[index], options))
  }
  return assetIds
}

// For non-image assets (resume/project PDFs, SVG logos) that shouldn't be
// rasterized -- stored as-is, no canvas pipeline involved.
export async function ingestRawAsset(store, project, file) {
  const assetId = createId('asset')
  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'bin'
  const storedFilename = `${assetId}.${extension}`

  await store.writeAsset(storedFilename, file)

  project.assets[assetId] = {
    id: assetId,
    originalFilename: file.name,
    storedFilename,
    mimeType: file.type || 'application/octet-stream',
    sizeBytes: file.size,
    createdAt: new Date().toISOString(),
  }

  return assetId
}

export async function removeAsset(store, project, assetId) {
  const entry = project.assets[assetId]
  if (!entry) return
  await store.deleteAsset(entry.storedFilename)
  delete project.assets[assetId]
}
