<script>
  import { buildSiteFiles, buildSiteZip, writeSiteToDirectory } from '../../export/buildSite.js'
  import { supportsFileSystemAccess } from '../../storage/capabilities.js'

  let { session } = $props()
  let busyMessage = $state('')
  let statusMessage = $state('')

  async function downloadZip() {
    busyMessage = 'Building site export...'
    statusMessage = ''
    try {
      const blob = await buildSiteZip(session.project, session.store)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${session.project.siteSettings.siteTitle || 'portfolio-site'}.zip`
      a.click()
      URL.revokeObjectURL(url)
      statusMessage = 'Downloaded! See the steps below to publish it.'
    } catch (err) {
      statusMessage = `Error: ${err.message}`
    } finally {
      busyMessage = ''
    }
  }

  async function exportToFolder() {
    busyMessage = 'Building site export...'
    statusMessage = ''
    try {
      const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' })
      const files = await buildSiteFiles(session.project, session.store)
      await writeSiteToDirectory(files, dirHandle)
      statusMessage = `Site files written to "${dirHandle.name}".`
    } catch (err) {
      if (err.name !== 'AbortError') statusMessage = `Error: ${err.message}`
    } finally {
      busyMessage = ''
    }
  }
</script>

<div class="publish-screen">
  <h2>Publish Your Site</h2>
  <p>This builds your finished website as static HTML/CSS files, ready to host for free on GitHub Pages.</p>

  <div class="actions">
    <button onclick={downloadZip}>Download Site (.zip)</button>
    {#if supportsFileSystemAccess()}
      <button onclick={exportToFolder}>Export Site to Folder</button>
    {/if}
  </div>

  {#if busyMessage}
    <p class="status">{busyMessage}</p>
  {/if}
  {#if statusMessage}
    <p class="status">{statusMessage}</p>
  {/if}

  <h3>How to publish to GitHub Pages</h3>
  <ol>
    <li>
      Go to <a href="https://github.com/new" target="_blank" rel="noopener noreferrer">github.com/new</a>
      and create a new <strong>public</strong> repository (any name).
    </li>
    <li>On the new repo's page, click <strong>"Add file" &rarr; "Upload files"</strong>.</li>
    <li>
      Unzip the file you downloaded above, then drag <em>all</em> of its contents (not the zip itself) into
      the upload area.
    </li>
    <li>Scroll down and click <strong>"Commit changes"</strong>.</li>
    <li>
      Go to the repo's <strong>Settings &rarr; Pages</strong>, and under "Build and deployment" set Source to
      <strong>"Deploy from a branch"</strong>, branch <strong>main</strong>, folder
      <strong>/ (root)</strong>. Click Save.
    </li>
    <li>
      Wait a few minutes, then your site will be live at
      <code>https://your-username.github.io/your-repo-name/</code>.
    </li>
  </ol>
  <p class="note">
    Your repository will be public, which means anyone can see the site's source files (including your
    contact info). That's normal for a free GitHub Pages site.
  </p>
</div>

<style>
  .publish-screen {
    max-width: 700px;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    margin: 1rem 0;
  }

  button {
    padding: 0.6rem 1.2rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    font: inherit;
  }

  .status {
    font-size: 0.9rem;
  }

  ol {
    padding-left: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  code {
    background: #f4f3ec;
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
  }

  .note {
    font-size: 0.9rem;
    opacity: 0.75;
    border-top: 1px solid var(--border);
    padding-top: 1rem;
    margin-top: 1.5rem;
  }
</style>
