<script>
  import { renderSitePages } from '../render/renderSite.js'
  import { buildPreviewAssetResolver } from '../render/previewResolver.js'

  let { session, pageKey } = $props()
  let html = $state('')
  let requestToken = 0

  $effect(() => {
    // JSON round-tripping the project synchronously (inside the tracked
    // portion of the effect) registers every field as a dependency, so this
    // re-runs on any edit -- the actual resolver/render work happens after an
    // await, where Svelte can no longer track reads.
    const snapshot = JSON.parse(JSON.stringify(session.project))
    const store = session.store
    const token = ++requestToken
    if (!store) return

    ;(async () => {
      const resolveAsset = await buildPreviewAssetResolver(store, snapshot)
      const pages = renderSitePages(snapshot, { makeResolver: () => resolveAsset })
      // Guards against a slower, now-stale render overwriting a newer one.
      if (token === requestToken) html = pages[pageKey]
    })()
  })
</script>

<div class="preview-pane">
  <p class="preview-label">Live Preview — {pageKey}</p>
  <iframe title="Site preview" srcdoc={html}></iframe>
</div>

<style>
  .preview-pane {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 320px;
  }

  .preview-label {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #888;
    margin: 0 0 0.5rem;
  }

  iframe {
    flex: 1;
    width: 100%;
    min-height: 500px;
    border: 1px solid var(--border);
    border-radius: 8px;
  }
</style>
