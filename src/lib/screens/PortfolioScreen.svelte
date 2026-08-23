<script>
  import { untrack } from 'svelte'
  import { createProject, createImageMedia, createYoutubeMedia } from '../../data/schema.js'
  import { ingestImageAssets, removeAsset } from '../../media/assetRegistry.js'
  import MediaThumb from '../MediaThumb.svelte'
  import PreviewPane from '../PreviewPane.svelte'

  let { session } = $props()
  const portfolio = $derived(session.project.portfolio)

  // One-time default selection on mount -- deliberately not reactive to
  // `portfolio` afterward, since selection is independent user-driven state.
  let selectedProjectId = $state(untrack(() => portfolio.projects[0]?.id ?? null))
  // Which single panel is showing -- independent of selection, so drilling
  // into a project and stepping back up via the breadcrumb doesn't lose
  // which project was selected.
  let view = $state('projects') // 'projects' | 'details'

  const selectedProject = $derived(
    portfolio.projects.find((proj) => proj.id === selectedProjectId) ?? null
  )
  // Clamps `view` against what's actually selected -- e.g. if the selected
  // project got deleted elsewhere, falls back to the projects list instead
  // of showing a blank details panel.
  const effectiveView = $derived(view === 'details' && selectedProject ? 'details' : 'projects')
  // The preview follows whichever panel is open: the project's own page
  // while editing its details, the gallery otherwise.
  const previewPageKey = $derived(effectiveView === 'details' ? 'project' : 'home')
  const previewProjectId = $derived(effectiveView === 'details' ? selectedProjectId : null)

  function update() {
    session.scheduleSave()
  }

  function addProject() {
    const proj = createProject('New Project')
    portfolio.projects.push(proj)
    selectedProjectId = proj.id
    // Stays on the projects panel so its title field is immediately visible
    // to rename -- "Open" is what drills into the details/media panel.
    update()
  }

  async function removeProject(id) {
    const index = portfolio.projects.findIndex((proj) => proj.id === id)
    if (index === -1) return
    const [removed] = portfolio.projects.splice(index, 1)
    for (const media of removed.media) {
      if (media.type === 'image') await removeAsset(session.store, session.project, media.assetId)
    }
    if (selectedProjectId === id) {
      selectedProjectId = portfolio.projects[0]?.id ?? null
      view = 'projects'
    }
    update()
  }

  function moveProject(index, delta) {
    const target = index + delta
    if (target < 0 || target >= portfolio.projects.length) return
    const [item] = portfolio.projects.splice(index, 1)
    portfolio.projects.splice(target, 0, item)
    update()
  }

  function openProject(id) {
    selectedProjectId = id
    view = 'details'
  }

  async function onAddImages(event) {
    const files = Array.from(event.target.files ?? [])
    if (!files.length || !selectedProject) return
    const assetIds = await ingestImageAssets(session.store, session.project, files)
    for (const assetId of assetIds) {
      selectedProject.media.push(createImageMedia({ assetId }))
    }
    update()
    event.target.value = ''
  }

  function extractYoutubeId(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([\w-]{11})/)
    return match ? match[1] : null
  }

  function addYoutube() {
    if (!selectedProject) return
    const url = prompt('Paste a YouTube video URL:')
    if (!url) return
    const videoId = extractYoutubeId(url)
    if (!videoId) {
      alert("That doesn't look like a YouTube URL.")
      return
    }
    selectedProject.media.push(createYoutubeMedia({ youtubeId: videoId }))
    update()
  }

  async function removeMedia(index) {
    if (!selectedProject) return
    const [media] = selectedProject.media.splice(index, 1)
    if (media?.type === 'image') await removeAsset(session.store, session.project, media.assetId)
    update()
  }

  function moveMedia(index, delta) {
    if (!selectedProject) return
    const target = index + delta
    if (target < 0 || target >= selectedProject.media.length) return
    const [item] = selectedProject.media.splice(index, 1)
    selectedProject.media.splice(target, 0, item)
    update()
  }
</script>

<div class="portfolio-screen">
  <h2>Portfolio</h2>
  <nav class="breadcrumb" aria-label="Portfolio editor breadcrumb">
    {#if effectiveView === 'projects'}
      <span class="crumb current">Projects</span>
    {:else}
      <button class="crumb" onclick={() => (view = 'projects')}>Projects</button>
      <span class="crumb-sep">/</span>
      <span class="crumb current">{selectedProject.title}</span>
    {/if}
  </nav>

  {#if effectiveView === 'projects'}
    <div class="panel">
      <h3>Projects</h3>
      {#each portfolio.projects as proj, index (proj.id)}
        <div class="list-row">
          <input
            class="row-name"
            class:selected={proj.id === selectedProjectId}
            value={proj.title}
            onfocus={() => (selectedProjectId = proj.id)}
            oninput={(e) => {
              proj.title = e.target.value
              update()
            }}
          />
          <button onclick={() => openProject(proj.id)}>Open &rarr;</button>
          <button onclick={() => moveProject(index, -1)} disabled={index === 0} aria-label="Move up">&uarr;</button>
          <button
            onclick={() => moveProject(index, 1)}
            disabled={index === portfolio.projects.length - 1}
            aria-label="Move down"
          >
            &darr;
          </button>
          <button onclick={() => removeProject(proj.id)} aria-label="Remove project">&times;</button>
        </div>
      {/each}
      <button onclick={addProject}>+ Add Project</button>
    </div>
  {:else}
    <div class="panel">
      <h3>Details</h3>
      <label for="proj-desc">Description</label>
      <textarea
        id="proj-desc"
        rows="4"
        value={selectedProject.description}
        oninput={(e) => {
          selectedProject.description = e.target.value
          update()
        }}
      ></textarea>

      <h4>Media</h4>
      {#each selectedProject.media as media, index (media.id)}
        <div class="media-row">
          {#if media.type === 'image'}
            <MediaThumb {session} assetId={media.assetId} />
            <div class="media-fields">
              <label>
                Caption
                <input
                  value={media.caption}
                  oninput={(e) => {
                    media.caption = e.target.value
                    update()
                  }}
                />
              </label>
              <label>
                Alt text (required)
                <input
                  value={media.altText}
                  oninput={(e) => {
                    media.altText = e.target.value
                    update()
                  }}
                />
              </label>
            </div>
          {:else}
            <div class="media-fields">
              <span class="youtube-label">YouTube: {media.youtubeId}</span>
              <label>
                Caption
                <input
                  value={media.caption}
                  oninput={(e) => {
                    media.caption = e.target.value
                    update()
                  }}
                />
              </label>
            </div>
          {/if}
          <div class="media-row-actions">
            <button onclick={() => moveMedia(index, -1)} disabled={index === 0} aria-label="Move up">&uarr;</button>
            <button
              onclick={() => moveMedia(index, 1)}
              disabled={index === selectedProject.media.length - 1}
              aria-label="Move down"
            >
              &darr;
            </button>
            <button onclick={() => removeMedia(index)} aria-label="Remove media">&times;</button>
          </div>
        </div>
      {/each}

      <div class="add-media-actions">
        <label class="file-button">
          + Add Images
          <input type="file" accept="image/*" multiple onchange={onAddImages} hidden />
        </label>
        <button onclick={addYoutube}>+ Add YouTube Video</button>
      </div>
    </div>
  {/if}

  <PreviewPane {session} pageKey={previewPageKey} projectId={previewProjectId} />
</div>

<style>
  .portfolio-screen {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.95rem;
  }

  .crumb {
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    color: var(--color-primary, #0b5fff);
    cursor: pointer;
    text-decoration: underline;
  }

  .crumb.current {
    color: inherit;
    font-weight: 600;
    text-decoration: none;
    cursor: default;
  }

  .crumb-sep {
    opacity: 0.5;
  }

  .panel {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    max-width: 600px;
  }

  .list-row {
    display: flex;
    gap: 0.3rem;
    align-items: center;
    min-width: 0;
    flex-wrap: wrap;
  }

  .row-name {
    flex: 1;
    min-width: 0;
    padding: 0.4rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font: inherit;
  }

  .row-name.selected {
    border-color: var(--color-primary, #1a1a1a);
    background: #f5f7ff;
  }

  button,
  .file-button {
    padding: 0.4rem 0.7rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    font-size: 0.85rem;
  }

  textarea,
  input {
    font: inherit;
    padding: 0.4rem;
    border: 1px solid #ccc;
    border-radius: 6px;
  }

  label {
    display: flex;
    flex-direction: column;
    font-size: 0.85rem;
    font-weight: 500;
    gap: 0.2rem;
  }

  .media-row {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.6rem;
  }

  .media-fields {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .media-row-actions {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .youtube-label {
    font-size: 0.85rem;
    font-weight: 500;
  }

  .add-media-actions {
    display: flex;
    gap: 0.5rem;
  }
</style>
