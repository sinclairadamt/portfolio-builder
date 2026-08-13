<script>
  import { untrack } from 'svelte'
  import { renderSitePages } from '../render/renderSite.js'
  import { buildPreviewAssetResolver } from '../render/previewResolver.js'

  let { session, pageKey } = $props()
  let html = $state('')
  let currentPageKey = $state(untrack(() => pageKey))
  let requestToken = 0

  // Reset to the screen's own default page whenever the pageKey prop changes
  // (e.g. this component remounts fresh when switching editor tabs).
  $effect(() => {
    currentPageKey = pageKey
  })

  // The preview has no real file tree behind it (it's one iframe showing one
  // page at a time), so nav clicks inside it can't really navigate -- they're
  // intercepted and posted here instead (see components/previewNav.js) to
  // swap which page renders into the same iframe.
  $effect(() => {
    function handleMessage(event) {
      if (event.data?.source === 'portfolio-builder-preview') {
        currentPageKey = event.data.pageKey
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  })

  $effect(() => {
    // JSON round-tripping the project synchronously (inside the tracked
    // portion of the effect) registers every field as a dependency, so this
    // re-runs on any edit -- the actual resolver/render work happens after an
    // await, where Svelte can no longer track reads.
    const snapshot = JSON.parse(JSON.stringify(session.project))
    const store = session.store
    const key = currentPageKey
    const token = ++requestToken
    if (!store) return

    ;(async () => {
      const resolveAsset = await buildPreviewAssetResolver(store, snapshot)
      const pages = renderSitePages(snapshot, { makeResolver: () => resolveAsset, isPreview: true })
      // Guards against a slower, now-stale render overwriting a newer one.
      if (token === requestToken) html = pages[key]
    })()
  })
</script>

<div class="preview-pane">
  <p class="preview-label">Live Preview — {currentPageKey}</p>
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
