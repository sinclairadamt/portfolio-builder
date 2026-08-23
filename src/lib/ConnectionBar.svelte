<script>
  let { session } = $props()
  let busyMessage = $state('')

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

<div class="bar">
  <div class="actions">
    {#if session.supportsFolderMode}
      <button onclick={() => run('Opening folder picker...', () => session.pickFolder())}>
        Choose Portfolio Folder
      </button>
    {/if}
    <button onclick={() => session.startZipProject()}>New Portfolio ZIP</button>
    <label class="file-button">
      Import Portfolio ZIP
      <input type="file" accept=".zip" onchange={onImportZipChange} hidden />
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
      <button onclick={() => run('Reconnecting...', () => session.reconnectFolder())}>Reconnect</button>
    </p>
  {/if}

  {#if session.project}
    <p class="save-status">
      {session.connectionName} &middot; {session.store?.mode} mode &middot; {session.saveStatus}
    </p>
  {/if}

  {#if session.errorMessage}
    <p class="error">{session.errorMessage}</p>
  {/if}
</div>

<style>
  .bar {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding-bottom: 0.75rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--border);
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
    font-size: 0.9rem;
  }

  .status {
    font-size: 0.9rem;
  }

  .needs-reconnect {
    color: #a15c00;
  }

  .save-status {
    font-size: 0.85rem;
    color: #666;
  }

  .error {
    color: #b00020;
  }
</style>
