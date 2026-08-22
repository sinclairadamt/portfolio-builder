<script>
  import { untrack } from 'svelte'
  import { createCategory, createProject, createImageMedia, createYoutubeMedia } from '../../data/schema.js'
  import { ingestImageAssets, removeAsset } from '../../media/assetRegistry.js'
  import MediaThumb from '../MediaThumb.svelte'
  import PreviewPane from '../PreviewPane.svelte'

  let { session } = $props()
  const portfolio = $derived(session.project.portfolio)

  // One-time default selection on mount -- deliberately not reactive to
  // `portfolio` afterward, since selection is independent user-driven state.
  let selectedCategoryId = $state(untrack(() => portfolio.categories[0]?.id ?? null))
  let selectedProjectId = $state(
    untrack(() => portfolio.categories[0]?.projects[0]?.id ?? null)
  )
  // Which single panel is showing -- independent of selection, so drilling
  // into a project and stepping back up via the breadcrumb doesn't lose
  // which category/project was selected.
  let view = $state('categories') // 'categories' | 'projects' | 'details'

  const selectedCategory = $derived(
    portfolio.categories.find((category) => category.id === selectedCategoryId) ?? null
  )
  const selectedProject = $derived(
    selectedCategory?.projects.find((proj) => proj.id === selectedProjectId) ?? null
  )
  // Clamps `view` against what's actually selected -- e.g. if the selected
  // project got deleted elsewhere, falls back to the projects list instead
  // of showing a blank details panel.
  const effectiveView = $derived(
    view === 'details' && selectedProject ? 'details' : view === 'projects' && selectedCategory ? 'projects' : 'categories'
  )

  function update() {
    session.scheduleSave()
  }

  function addCategory() {
    const category = createCategory('New Category')
    portfolio.categories.push(category)
    selectedCategoryId = category.id
    selectedProjectId = null
    // Stays on the categories panel (not auto-drilling into it) so its name
    // field is immediately visible to rename -- "Open" is what drills in.
    update()
  }

  function removeCategory(id) {
    const index = portfolio.categories.findIndex((category) => category.id === id)
    if (index === -1) return
    portfolio.categories.splice(index, 1)
    if (selectedCategoryId === id) {
      selectedCategoryId = portfolio.categories[0]?.id ?? null
      selectedProjectId = null
      view = 'categories'
    }
    update()
  }

  function moveCategory(index, delta) {
    const target = index + delta
    if (target < 0 || target >= portfolio.categories.length) return
    const [item] = portfolio.categories.splice(index, 1)
    portfolio.categories.splice(target, 0, item)
    update()
  }

  function openCategory(id) {
    selectedCategoryId = id
    selectedProjectId = null
    view = 'projects'
  }

  function addProject() {
    if (!selectedCategory) return
    const proj = createProject('New Project')
    selectedCategory.projects.push(proj)
    selectedProjectId = proj.id
    // Stays on the projects panel so its title field is immediately visible
    // to rename -- "Open" is what drills into the details/media panel.
    update()
  }

  async function removeProject(id) {
    if (!selectedCategory) return
    const index = selectedCategory.projects.findIndex((proj) => proj.id === id)
    if (index === -1) return
    const [removed] = selectedCategory.projects.splice(index, 1)
    for (const media of removed.media) {
      if (media.type === 'image') await removeAsset(session.store, session.project, media.assetId)
    }
    if (selectedProjectId === id) {
      selectedProjectId = null
      view = 'projects'
    }
    update()
  }

  function moveProject(index, delta) {
    if (!selectedCategory) return
    const target = index + delta
    if (target < 0 || target >= selectedCategory.projects.length) return
    const [item] = selectedCategory.projects.splice(index, 1)
    selectedCategory.projects.splice(target, 0, item)
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
  <nav class="breadcrumb" aria-label="Portfolio editor breadcrumb">
    {#if effectiveView === 'categories'}
      <span class="crumb current">Categories</span>
    {:else if effectiveView === 'projects'}
      <button class="crumb" onclick={() => (view = 'categories')}>Categories</button>
      <span class="crumb-sep">/</span>
      <span class="crumb current">{selectedCategory.name}</span>
    {:else}
      <button class="crumb" onclick={() => (view = 'categories')}>Categories</button>
      <span class="crumb-sep">/</span>
      <button class="crumb" onclick={() => (view = 'projects')}>{selectedCategory.name}</button>
      <span class="crumb-sep">/</span>
      <span class="crumb current">{selectedProject.title}</span>
    {/if}
  </nav>

  {#if effectiveView === 'categories'}
    <div class="panel">
      <h3>Categories</h3>
      {#each portfolio.categories as category, index (category.id)}
        <div class="list-row">
          <input
            class="row-name"
            class:selected={category.id === selectedCategoryId}
            value={category.name}
            onfocus={() => (selectedCategoryId = category.id)}
            oninput={(e) => {
              category.name = e.target.value
              update()
            }}
          />
          <button onclick={() => openCategory(category.id)}>Open &rarr;</button>
          <button onclick={() => moveCategory(index, -1)} disabled={index === 0} aria-label="Move up">&uarr;</button>
          <button
            onclick={() => moveCategory(index, 1)}
            disabled={index === portfolio.categories.length - 1}
            aria-label="Move down"
          >
            &darr;
          </button>
          <button onclick={() => removeCategory(category.id)} aria-label="Remove category">&times;</button>
        </div>
      {/each}
      <button onclick={addCategory}>+ Add Category</button>
    </div>
  {:else if effectiveView === 'projects'}
    <div class="panel">
      <h3>Projects in "{selectedCategory.name}"</h3>
      {#each selectedCategory.projects as proj, index (proj.id)}
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
            disabled={index === selectedCategory.projects.length - 1}
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
      <h3>Project Details</h3>
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

  <PreviewPane {session} pageKey="home" />
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
