<script>
  import { untrack } from 'svelte'
  import { renderSitePages } from '../render/renderSite.js'
  import { buildPreviewAssetResolver } from '../render/previewResolver.js'

  let { session, pageKey, minHeight = '500px' } = $props()
  let html = $state('')
  let currentPageKey = $state(untrack(() => pageKey))
  let currentProjectId = $state(null)
  let requestToken = 0

  // Reset to the screen's own default page whenever the pageKey prop changes
  // (e.g. this component remounts fresh when switching editor tabs).
  $effect(() => {
    currentPageKey = pageKey
    currentProjectId = null
  })

  // The preview has no real file tree behind it (it's one iframe showing one
  // page at a time), so nav clicks inside it can't really navigate -- they're
  // intercepted and posted here instead (see components/previewNav.js) to
  // swap which page renders into the same iframe.
  $effect(() => {
    function handleMessage(event) {
      if (event.data?.source === 'portfolio-builder-preview') {
        currentPageKey = event.data.pageKey
        currentProjectId = event.data.projectId ?? null
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  })

  const previewLabel = $derived(
    currentPageKey === 'project'
      ? (session.project.portfolio.projects.find((p) => p.id === currentProjectId)?.title ?? 'project')
      : currentPageKey
  )

  $effect(() => {
    // JSON round-tripping the project synchronously (inside the tracked
    // portion of the effect) registers every field as a dependency, so this
    // re-runs on any edit -- the actual resolver/render work happens after an
    // await, where Svelte can no longer track reads.
    const snapshot = JSON.parse(JSON.stringify(session.project))
    const store = session.store
    const key = currentPageKey
    const projectId = currentProjectId
    const token = ++requestToken
    if (!store) return

    ;(async () => {
      const resolveAsset = await buildPreviewAssetResolver(store, snapshot)
      const pages = renderSitePages(snapshot, { makeResolver: () => resolveAsset, isPreview: true })
      // Falls back to the gallery if the previewed project no longer exists
      // (e.g. deleted in the editor while its page happened to be open here).
      const nextHtml = key === 'project' ? pages.projects[projectId] ?? pages.home : pages[key]
      if (token === requestToken) html = nextHtml
    })()
  })
</script>

<div class="preview-pane">
  <p class="preview-label">Live Preview — {previewLabel}</p>
  <iframe title="Site preview" srcdoc={html} style="min-height: {minHeight}"></iframe>
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
