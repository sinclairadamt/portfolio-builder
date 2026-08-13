<script>
  // Temporary test harness for the Phase 2 persistence layer -- exercises
  // folder mode, ZIP mode, autosave, and reconnect. Gets replaced by the real
  // editor screens in Phase 5.
  import { ProjectSession } from '../storage/projectSession.svelte.js'

  let session = $state(new ProjectSession())
  let zipFileInput = $state(null)
  let busyMessage = $state('')

  session.restore()

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

  .error {
    color: #b00020;
  }
</style>
