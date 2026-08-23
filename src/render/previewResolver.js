// Pre-warms every referenced asset's blob: URL before rendering, since the
// render functions expect a synchronous resolveAsset callback but the
// storage layer's readAssetUrl() is async. Stores cache these internally by
// storedFilename, so repeated calls across re-renders are cheap.
//
// Resolved in parallel, and one asset failing to resolve (e.g. a transient
// FSA permission/disk hiccup, or an asset whose write is still in flight)
// must not abort the whole preview render -- the resolver already treats a
// missing entry as '' below, so a failed asset just renders blank instead of
// leaving every OTHER setting change (alignment, colors, etc.) stuck showing
// stale content until some later render happens to succeed.
export async function buildPreviewAssetResolver(store, project) {
  const urlByAssetId = new Map()
  const assetIds = Object.keys(project.assets)
  await Promise.all(
    assetIds.map(async (assetId) => {
      const entry = project.assets[assetId]
      try {
        urlByAssetId.set(assetId, await store.readAssetUrl(entry.storedFilename))
      } catch (err) {
        console.error(`Preview: failed to resolve asset ${assetId} (${entry.storedFilename})`, err)
      }
    })
  )
  return (assetId) => urlByAssetId.get(assetId) ?? ''
}
