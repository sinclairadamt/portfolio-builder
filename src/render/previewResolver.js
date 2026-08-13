// Pre-warms every referenced asset's blob: URL before rendering, since the
// render functions expect a synchronous resolveAsset callback but the
// storage layer's readAssetUrl() is async. Stores cache these internally by
// storedFilename, so repeated calls across re-renders are cheap.
export async function buildPreviewAssetResolver(store, project) {
  const urlByAssetId = new Map()
  for (const assetId of Object.keys(project.assets)) {
    const entry = project.assets[assetId]
    urlByAssetId.set(assetId, await store.readAssetUrl(entry.storedFilename))
  }
  return (assetId) => urlByAssetId.get(assetId) ?? ''
}
