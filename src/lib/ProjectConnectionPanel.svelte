<script>
  // Temporary test harness for the persistence + image pipeline layers --
  // exercises folder mode, ZIP mode, autosave, reconnect, and image ingest.
  // Gets replaced by the real editor screens in Phase 5.
  import { ProjectSession } from '../storage/projectSession.svelte.js'
  import { ingestImageAsset } from '../media/assetRegistry.js'

  let session = $state(new ProjectSession())
  let zipFileInput = $state(null)
  let busyMessage = $state('')
  let photoUrl = $state('')

  session.restore()

  $effect(() => {
    const assetId = session.project?.about?.photoAssetId
    if (!assetId || !session.store) {
      photoUrl = ''
      return
    }
    const entry = session.project.assets[assetId]
    session.store.readAssetUrl(entry.storedFilename).then((url) => (photoUrl = url))
  })

  async function run(label, fn) {
    busyMessage = label
    try {
      await fn()
    } catch (err) {
      session.errorMessage = err.message
      session.saveStatus = 'error'
    } finally {
      busyMessage = ''
    }
  }

  function onBioInput(event) {
    session.project.about.bio = event.target.value
    session.scheduleSave()
  }

  async function onImportZipChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    await run('Importing ZIP...', () => session.importZip(file))
    event.target.value = ''
  }

  async function onExportZip() {
    await run('Exporting ZIP...', async () => {
      const blob = await session.exportZip()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${session.connectionName || 'portfolio-project'}.zip`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  async function onPhotoChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    await run('Processing photo...', async () => {
      const assetId = await ingestImageAsset(session.store, session.project, file)
      session.project.about.photoAssetId = assetId
      session.scheduleSave()
    })
    event.target.value = ''
  }
</script>

<div class="panel">
  <p class="mode-note">
    {#if session.supportsFolderMode}
      This browser supports folder mode (File System Access API) and ZIP mode.
    {:else}
      This browser only supports ZIP mode (no File System Access API here).
    {/if}
  </p>

  <div class="actions">
    {#if session.supportsFolderMode}
      <button onclick={() => run('Opening folder picker...', () => session.pickFolder())}>
        Choose Project Folder
      </button>
    {/if}
    <button onclick={() => session.startZipProject()}>New ZIP Project</button>
    <label class="file-button">
      Import ZIP
      <input
        bind:this={zipFileInput}
        type="file"
        accept=".zip"
        onchange={onImportZipChange}
        hidden
      />
    </label>
    {#if session.store?.mode === 'zip'}
      <button onclick={onExportZip}>Export ZIP</button>
    {/if}
  </div>

  {#if busyMessage}
    <p class="status">{busyMessage}</p>
  {/if}

  {#if session.connectionStatus === 'needs-reconnect'}
    <p class="status needs-reconnect">
      Reconnect to "{session.connectionName}" to resume editing.
      <button onclick={() => run('Reconnecting...', () => session.reconnectFolder())}>
        Reconnect
      </button>
    </p>
  {/if}

  {#if session.project}
    <div class="editor-stub">
      <label for="bio">Bio (proves round-trip save/load)</label>
      <textarea id="bio" value={session.project.about.bio} oninput={onBioInput} rows="4"
      ></textarea>

      <label for="photo">About photo (proves image resize/compress + asset registry)</label>
      <input id="photo" type="file" accept="image/*" onchange={onPhotoChange} />
      {#if photoUrl}
        <img class="photo-preview" src={photoUrl} alt="About preview" />
        {#if session.project.about.photoAssetId}
          {@const asset = session.project.assets[session.project.about.photoAssetId]}
          <p class="asset-info">
            {asset.originalFilename} &rarr; {asset.width}&times;{asset.height},
            {(asset.sizeBytes / 1024).toFixed(0)}KB ({asset.mimeType})
          </p>
        {/if}
      {/if}

      <p class="save-status">
        {session.connectionName} &middot; {session.store?.mode} mode &middot; {session.saveStatus}
      </p>
    </div>
  {/if}

  {#if session.errorMessage}
    <p class="error">{session.errorMessage}</p>
  {/if}
</div>

<style>
  .panel {
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .mode-note {
    font-size: 0.9rem;
    color: #666;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  button,
  .file-button {
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    background: white;
    cursor: pointer;
  }

  .status {
    font-size: 0.9rem;
  }

  .needs-reconnect {
    color: #a15c00;
  }

  .editor-stub {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .save-status {
    font-size: 0.85rem;
    color: #666;
  }

  .photo-preview {
    max-width: 200px;
    border-radius: 6px;
  }

  .asset-info {
    font-size: 0.8rem;
    color: #666;
  }

  .error {
    color: #b00020;
  }
</style>
